
 // Everwild Survival — حقيبة اللاعب، المعدات، والمعاينة ثلاثية الأبعاد
// متوافقة مع createInventory(THREE, controls, player)

export function createInventory(THREE, controls, player) {
  if (!THREE || !controls || !player?.root) {
    throw new Error("بيانات إنشاء الحقيبة غير مكتملة.");
  }

  document.getElementById("ew-inventory-style")?.remove();
  document.getElementById("ew-inventory")?.remove();

  const STORAGE_KEY = "everwild_inventory_v1";
  const HOTBAR_KEY = "everwild_hotbar_v1";
  const equipmentSlots = [
    { id: "head", name: "الخوذة", icon: "🪖" },
    { id: "chest", name: "درع الصدر", icon: "🦺" },
    { id: "legs", name: "البنطلون", icon: "👖" },
    { id: "feet", name: "الحذاء", icon: "🥾" }
  ];

  let items = [];
  let equipment = { head: null, chest: null, legs: null, feet: null };
  let hotbar = Array(6).fill(null);
  let selectedId = null;
  let activeTab = "all";
  let previewRenderer = null;
  let previewScene = null;
  let previewCamera = null;
  let previewModel = null;
  let worldGear = new THREE.Group();
  worldGear.name = "Everwild_Equipped_Gear";
  player.root.add(worldGear);
  let handTool = null;
  let previewGear = null;

  const material = (color, roughness = 0.68, metalness = 0.12) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });

  function safeItem(item) {
    if (!item || typeof item.id !== "string" || typeof item.name !== "string") return null;
    return {
      id: item.id,
      name: item.name,
      icon: item.icon || "📦",
      type: item.type || "resource",
      quantity: Math.max(1, Number(item.quantity) || 1),
      ...(item.slot ? { slot: item.slot } : {}),
      ...(Number.isFinite(Number(item.defense)) ? { defense: Number(item.defense) } : {}),
      ...(item.model ? { model: item.model } : {}),
      ...(item.tool ? { tool: item.tool } : {})
    };
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Array.isArray(saved.items)) items = saved.items.map(safeItem).filter(Boolean);
      if (saved?.equipment && typeof saved.equipment === "object") {
        for (const slot of equipmentSlots) {
          const id = saved.equipment[slot.id];
          equipment[slot.id] = typeof id === "string" ? id : null;
        }
      }
      const savedHotbar = JSON.parse(localStorage.getItem(HOTBAR_KEY) || "null");
      if (Array.isArray(savedHotbar)) hotbar = Array.from({ length: 6 }, (_, i) =>
        typeof savedHotbar[i] === "string" ? savedHotbar[i] : null);
    } catch (error) {
      console.warn("تعذر تحميل الحقيبة:", error);
    }

    for (const slot of equipmentSlots) {
      if (equipment[slot.id] && !items.some(item => item.id === equipment[slot.id])) {
        equipment[slot.id] = null;
      }
    }
    hotbar = hotbar.map(id => id && items.some(item => item.id === id) ? id : null);
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, equipment }));
      localStorage.setItem(HOTBAR_KEY, JSON.stringify(hotbar));
    } catch (error) {
      console.warn("تعذر حفظ الحقيبة:", error);
    }
  }

  load();

  const style = document.createElement("style");
  style.id = "ew-inventory-style";
  style.textContent = `
    #ew-inventory{position:fixed;inset:0;z-index:3000;display:none;align-items:center;justify-content:flex-end;padding:12px;color:#edf7ff;font-family:Arial,sans-serif;direction:rtl;background:#02081245;backdrop-filter:blur(2px)}
    #ew-inventory.open{display:flex}#ew-inventory *{box-sizing:border-box}#ew-inventory button{font:inherit;color:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
    #ew-inventory .bag-panel{width:min(760px,100%);height:min(620px,94dvh);display:flex;flex-direction:column;overflow:hidden;border:1px solid #436779;border-radius:15px;background:linear-gradient(145deg,#142633f7,#07111df7);box-shadow:0 18px 65px #000b}
    #ew-inventory .bag-header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:11px 13px;background:#132936;border-bottom:1px solid #ffffff18;flex-shrink:0}
    #ew-inventory .bag-title{font-size:17px;font-weight:800;letter-spacing:.2px}#ew-inventory .bag-subtitle{font-size:10px;color:#a1bdca;margin-top:4px}
    #ew-inventory .bag-close{width:35px;height:35px;border:1px solid #476a7c;border-radius:9px;background:#203a49;font-size:23px}
    #ew-inventory .bag-tabs{display:flex;gap:5px;padding:8px;flex-shrink:0}#ew-inventory .bag-tab{flex:1;min-width:0;padding:8px 3px;border:1px solid #304b5d;border-radius:8px;background:#10202c;color:#a9c2cf;font-size:11px}
    #ew-inventory .bag-tab.active{background:#15504f;border-color:#64e3d1;color:#fff}
    #ew-inventory .bag-content{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:8px;padding:8px;min-height:0;flex:1;overflow:hidden}
    #ew-inventory .bag-card{min-width:0;min-height:0;display:flex;flex-direction:column;padding:8px;border:1px solid #2c4657;border-radius:11px;background:#0b1824}
    #ew-inventory .bag-heading{display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:8px;font-size:12px;font-weight:700;flex-shrink:0}#ew-inventory .bag-count{font-size:9px;font-weight:400;color:#91adbc}
    #ew-inventory .bag-items{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));grid-auto-rows:minmax(47px,1fr);gap:5px;overflow-y:auto;min-height:0;align-content:start}
    #ew-inventory .bag-item{position:relative;display:flex;min-width:0;min-height:47px;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:4px 1px;border:1px solid #344e60;border-radius:7px;background:linear-gradient(145deg,#1b3040,#11212e);font-size:9px;overflow-wrap:anywhere;text-align:center;user-select:none}
    #ew-inventory .bag-item.selected{border:2px solid #69f1dd;background:#17434a;box-shadow:0 0 11px #42d9d344}#ew-inventory .bag-icon{font-size:20px;line-height:1.1}#ew-inventory .bag-qty{position:absolute;top:2px;left:3px;color:#a5fff1;font-size:9px}
    #ew-inventory .bag-item.hotbarbed:after{content:'✓';position:absolute;right:3px;top:1px;color:#75f0d5;font-size:9px}
    #ew-inventory .bag-empty{grid-column:1/-1;padding:18px 4px;text-align:center;color:#8098a8;font-size:10px}
    #ew-inventory .character-layout{display:grid;grid-template-columns:minmax(0,1fr) 92px;gap:7px;min-height:0;flex:1}
    #ew-inventory .bag-preview{position:relative;min-width:0;min-height:170px;overflow:hidden;border:1px solid #2d4d5f;border-radius:9px;background:radial-gradient(ellipse,#2b4c5a,#0d1722 76%)}#ew-inventory .bag-preview canvas{display:block;width:100%;height:100%}
    #ew-inventory .bag-preview-label{position:absolute;bottom:5px;left:4px;right:4px;text-align:center;color:#c1d9e3;font-size:9px;pointer-events:none;text-shadow:0 2px 4px #000}
    #ew-inventory .equipment-grid{display:grid;grid-template-columns:1fr;grid-template-rows:repeat(4,minmax(0,1fr));gap:5px;min-height:0}
    #ew-inventory .equipment-slot{display:flex;align-items:center;gap:5px;min-width:0;min-height:0;padding:5px;border:1px solid #354f60;border-radius:8px;background:#172a38;text-align:right}
    #ew-inventory .equipment-slot.filled{border-color:#62bcae;background:#183a3c}#ew-inventory .equipment-icon{flex:0 0 23px;text-align:center;font-size:18px}#ew-inventory .equipment-label{display:block;color:#91adbc;font-size:9px;margin-bottom:3px}#ew-inventory .equipment-name{display:block;font-size:9px;overflow-wrap:anywhere;line-height:1.2}
    #ew-inventory .bag-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;margin-top:7px;flex-shrink:0}#ew-inventory .bag-stat{padding:6px 3px;border-radius:7px;background:#162735;text-align:center;color:#9bb7c6;font-size:9px}#ew-inventory .bag-stat strong{display:block;margin-top:3px;color:#fff;font-size:10px}
    #ew-inventory .bag-actions{display:flex;gap:6px;padding:8px;border-top:1px solid #ffffff16;flex-shrink:0}#ew-inventory .bag-action{flex:1;min-width:0;min-height:36px;padding:6px 3px;border:1px solid #426777;border-radius:8px;background:#193746;font-size:10px}#ew-inventory .bag-action.primary{border-color:#53cbbb;background:#17635d}#ew-inventory .bag-action:disabled{opacity:.38;cursor:default}
    #ew-inventory .bag-notice{min-height:22px;padding:0 10px 6px;color:#91e0d5;font-size:10px;flex-shrink:0}#ew-inventory .bag-hint{color:#8fa9b9;font-size:9px;line-height:1.5;margin-top:7px}
    @media(max-width:520px){#ew-inventory{padding:5px}#ew-inventory .bag-panel{width:min(100%,520px);height:min(600px,95dvh);border-radius:12px}#ew-inventory .bag-content{grid-template-columns:minmax(0,.94fr) minmax(0,1fr);gap:5px;padding:5px}#ew-inventory .bag-card{padding:5px}#ew-inventory .bag-items{gap:3px;grid-auto-rows:minmax(43px,1fr)}#ew-inventory .bag-item{min-height:43px;font-size:8px}#ew-inventory .bag-icon{font-size:18px}#ew-inventory .character-layout{grid-template-columns:minmax(0,1fr) 70px;gap:4px}#ew-inventory .bag-preview{min-height:155px}#ew-inventory .equipment-slot{padding:3px;gap:2px}#ew-inventory .equipment-icon{flex-basis:18px;font-size:15px}#ew-inventory .equipment-name,#ew-inventory .equipment-label{font-size:8px}#ew-inventory .bag-title{font-size:15px}#ew-inventory .bag-actions{padding:6px;gap:4px}#ew-inventory .bag-action{font-size:9px}}
  `;
  document.head.appendChild(style);

  const panel = document.createElement("div");
  panel.id = "ew-inventory";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.innerHTML = `
    <section class="bag-panel">
      <header class="bag-header"><div><div class="bag-title">🎒 حقيبة الناجي</div><div class="bag-subtitle">المعدات — الموارد — الأدوات</div></div><button class="bag-close" type="button" aria-label="إغلاق">×</button></header>
      <nav class="bag-tabs"><button class="bag-tab active" data-tab="all">الكل</button><button class="bag-tab" data-tab="equipment">المعدات</button><button class="bag-tab" data-tab="weapon">الأدوات</button><button class="bag-tab" data-tab="armor">الدروع</button></nav>
      <div class="bag-content">
        <section class="bag-card"><div class="bag-heading"><span id="bag-section-title">محتويات الحقيبة</span><span class="bag-count" id="bag-count">0 / 25</span></div><div class="bag-items" id="bag-items"></div><div class="bag-hint">اسحب أي أداة إلى خانة في الشريط السفلي، أو اضغط عليها ثم اختر التجهيز.</div></section>
        <section class="bag-card"><div class="bag-heading"><span>شخصيتك ومعداتك</span><span class="bag-count">معاينة مباشرة</span></div><div class="character-layout"><div class="bag-preview" id="bag-preview"><div class="bag-preview-label">المعدات تظهر على الشخصية</div></div><div class="equipment-grid" id="bag-equipment"></div></div><div class="bag-stats"><div class="bag-stat">الحماية<strong id="bag-defense">0</strong></div><div class="bag-stat">الأغراض<strong id="bag-total">0</strong></div></div></section>
      </div>
      <div class="bag-actions"><button class="bag-action primary" id="bag-equip" disabled>تجهيز</button><button class="bag-action" id="bag-unequip" disabled>خلع</button><button class="bag-action" id="bag-close-bottom">رجوع للعالم</button></div><div class="bag-notice" id="bag-notice" aria-live="polite"></div>
    </section>`;
  document.body.appendChild(panel);

  const $ = selector => panel.querySelector(selector);
  const itemGrid = $("#bag-items");
  const equipmentGrid = $("#bag-equipment");
  const notice = $("#bag-notice");
  const getItem = id => items.find(item => item.id === id) || null;

  function slotFor(item) {
    if (!item) return null;
    const valid = equipmentSlots.some(slot => slot.id === item.slot);
    if (valid) return item.slot;
    if (item.type === "armor") {
      const n = `${item.id} ${item.name}`.toLowerCase();
      if (/helmet|hat|head|خوذ|قبع/.test(n)) return "head";
      if (/pant|leg|trouser|بنطلون|ساق/.test(n)) return "legs";
      if (/boot|shoe|foot|حذاء|جزمة/.test(n)) return "feet";
      return "chest";
    }
    return null;
  }

  function clearGroup(group) {
    while (group.children.length) {
      const obj = group.children[0];
      group.remove(obj);
      obj.traverse?.(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material && child.material.userData?.ewOwned) child.material.dispose();
      });
    }
}
 
  function makeGear(slotId, item) {
    const group = new THREE.Group();
    group.name = `gear-${slotId}`;

    const color = Number(item?.color) || (
      slotId === "head" ? 0x647d91 :
      slotId === "chest" ? 0x456a80 :
      slotId === "legs" ? 0x344d61 : 0x283d4b
    );
    const mat = material(color, 0.48, 0.25);
    mat.userData.ewOwned = true;

    function addMesh(geometry, y, scale = [1, 1, 1], x = 0, z = 0) {
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(x, y, z);
      mesh.scale.set(...scale);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    }

    if (slotId === "head") {
      addMesh(new THREE.SphereGeometry(0.24, 14, 10), 2.02, [1.08, 0.58, 1.08]);
      addMesh(new THREE.BoxGeometry(0.4, 0.055, 0.36), 1.92, [1, 1, 1], 0, 0.02);
    } else if (slotId === "chest") {
      addMesh(new THREE.BoxGeometry(0.62, 0.57, 0.34), 1.36, [1, 1, 1]);
      addMesh(new THREE.BoxGeometry(0.68, 0.1, 0.37), 1.12, [1, 1, 1]);
      addMesh(new THREE.BoxGeometry(0.1, 0.43, 0.36), 1.38, [1, 1, 1], -0.26, 0);
      addMesh(new THREE.BoxGeometry(0.1, 0.43, 0.36), 1.38, [1, 1, 1], 0.26, 0);
    } else if (slotId === "legs") {
      addMesh(new THREE.BoxGeometry(0.24, 0.66, 0.28), 0.67, [1, 1, 1], -0.15, 0);
      addMesh(new THREE.BoxGeometry(0.24, 0.66, 0.28), 0.67, [1, 1, 1], 0.15, 0);
    } else if (slotId === "feet") {
      addMesh(new THREE.BoxGeometry(0.25, 0.17, 0.39), 0.15, [1, 1, 1], -0.15, 0.035);
      addMesh(new THREE.BoxGeometry(0.25, 0.17, 0.39), 0.15, [1, 1, 1], 0.15, 0.035);
    }

    group.userData.itemId = item.id;
    group.userData.ewGear = true;
    return group;
  }

  function buildWorldGear() {
    clearGroup(worldGear);
    for (const slot of equipmentSlots) {
      const item = getItem(equipment[slot.id]);
      if (!item) continue;
      worldGear.add(makeGear(slot.id, item));
    }
  }

  function buildPreviewGear() {
    if (!previewScene || !previewModel) return;
    if (previewGear) {
      previewScene.remove(previewGear);
      clearGroup(previewGear);
    }

    previewGear = new THREE.Group();
    previewGear.name = "Everwild_Preview_Gear";

    for (const slot of equipmentSlots) {
      const item = getItem(equipment[slot.id]);
      if (item) previewGear.add(makeGear(slot.id, item));
    }

    previewModel.add(previewGear);
    previewRenderer?.render(previewScene, previewCamera);
  }

  function refreshEquippedGear() {
    buildWorldGear();
    buildPreviewGear();
    save();
  }

  function makeHandTool(item) {
    const group = new THREE.Group();
    group.name = "Everwild_Hand_Tool";

    const handleMat = material(0x725136, 0.8, 0.05);
    handleMat.userData.ewOwned = true;
    const headMat = material(Number(item.color) || 0x8b9da8, 0.4, 0.45);
    headMat.userData.ewOwned = true;

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.035, 0.52, 7),
      handleMat
    );
    handle.position.set(0, 0, 0);
    handle.rotation.z = -0.18;
    group.add(handle);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.12, 0.1),
      headMat
    );
    head.position.set(0.02, 0.2, 0);
    group.add(head);

    group.position.set(0.34, 1.13, 0.28);
    group.rotation.set(0.15, 0, -0.45);
    group.userData.itemId = item.id;
    return group;
  }

  function holdItem(item) {
    if (handTool) {
      player.root.remove(handTool);
      clearGroup(handTool);
      handTool = null;
    }

    if (!item || !["weapon", "tool"].includes(item.type)) return;

    handTool = makeHandTool(item);
    player.root.add(handTool);

    document.dispatchEvent(new CustomEvent("ew:hotbar-selected", {
      detail: { item: { ...item } }
    }));
  }

  function setupPreview() {
    const host = $("#bag-preview");
    if (previewRenderer) return;

    try {
      previewScene = new THREE.Scene();
      previewScene.background = new THREE.Color(0x10212d);
      previewScene.add(new THREE.HemisphereLight(0xe0f5ff, 0x39443f, 2));

      const light = new THREE.DirectionalLight(0xffe9c7, 2.2);
      light.position.set(-3, 6, 4);
      previewScene.add(light);

      previewModel = player.root.clone(true);
      previewModel.position.set(0, 0, 0);
      previewModel.rotation.y = Math.PI;

      previewModel.traverse(child => {
        if (child.name === "Everwild_Equipped_Gear" ||
            child.name === "Everwild_Hand_Tool") {
          child.parent?.remove(child);
        }
      });

      previewScene.add(previewModel);

      previewCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      previewCamera.position.set(0, 1.35, 5.6);
      previewCamera.lookAt(0, 1.05, 0);

      previewRenderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "low-power"
      });
      previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      previewRenderer.outputColorSpace = THREE.SRGBColorSpace;
      host.prepend(previewRenderer.domElement);
      resizePreview();
      buildPreviewGear();
    } catch (error) {
      console.warn("تعذرت معاينة الشخصية:", error);
      const label = host.querySelector(".bag-preview-label");
      if (label) label.textContent = "تعذرت معاينة الشخصية على هذا الجهاز";
    }
  }

  function resizePreview() {
    if (!previewRenderer || !previewCamera) return;
    const host = $("#bag-preview");
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    previewRenderer.setSize(width, height, false);
    previewCamera.aspect = width / height;
    previewCamera.updateProjectionMatrix();
    previewRenderer.render(previewScene, previewCamera);
  }

  function renderItems() {
    let shown = items;

    if (activeTab === "weapon") {
      shown = items.filter(item => ["weapon", "tool"].includes(item.type));
    } else if (activeTab === "armor") {
      shown = items.filter(item => item.type === "armor");
    } else if (activeTab === "equipment") {
      shown = items.filter(item => slotFor(item) || ["weapon", "tool"].includes(item.type));
    }

    $("#bag-section-title").textContent = ({
      all: "محتويات الحقيبة",
      equipment: "المعدات",
      weapon: "الأسلحة والأدوات",
      armor: "الدروع"
    })[activeTab];

    $("#bag-count").textContent = `${items.length} / 25 خانة`;
    $("#bag-total").textContent = items.reduce((sum, item) => sum + item.quantity, 0);

    itemGrid.innerHTML = "";

    if (!shown.length) {
      const empty = document.createElement("div");
      empty.className = "bag-empty";
      empty.textContent = "الحقيبة فارغة حاليًا. ستظهر الأغراض هنا عند جمعها.";
      itemGrid.appendChild(empty);
    }

    for (const item of shown) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bag-item" +
        (item.id === selectedId ? " selected" : "") +
        (hotbar.includes(item.id) ? " hotbarbed" : "");
      button.draggable = true;
      button.dataset.itemId = item.id;

      const quantity = document.createElement("span");
      quantity.className = "bag-qty";
      quantity.textContent = "×" + item.quantity;

      const icon = document.createElement("span");
      icon.className = "bag-icon";
      icon.textContent = item.icon;

      const name = document.createElement("span");
      name.textContent = item.name;

      button.append(quantity, icon, name);

      button.addEventListener("click", () => {
        selectedId = item.id;
        notice.textContent = ["weapon", "tool"].includes(item.type)
          ? `${item.name} — تقدر تعيّنه في الشريط السفلي.`
          : slotFor(item)
          ? `${item.name} — جاهز للتجهيز.`
          : `${item.name} — مورد في الحقيبة.`;
        render();
      });

      button.addEventListener("dragstart", event => {
        event.dataTransfer?.setData("text/plain", item.id);
        if (event.dataTransfer) event.dataTransfer.effectAllowed = "copy";
      });

      itemGrid.appendChild(button);
    }

    const selected = getItem(selectedId);
    $("#bag-equip").disabled = !selected ||
      (!slotFor(selected) && !["weapon", "tool"].includes(selected.type));
    $("#bag-unequip").disabled = !equipmentSlots.some(slot =>
      equipment[slot.id] === selectedId);
  }

  function renderEquipment() {
    equipmentGrid.innerHTML = "";
    let defense = 0;

    for (const slot of equipmentSlots) {
      const item = getItem(equipment[slot.id]);
      if (item) defense += Number(item.defense || 0);

      const button = document.createElement("button");
      button.type = "button";
      button.className = "equipment-slot" + (item ? " filled" : "");
      button.dataset.slot = slot.id;

      const icon = document.createElement("span");
      icon.className = "equipment-icon";
      icon.textContent = item ? item.icon : slot.icon;

      const text = document.createElement("span");
      const label = document.createElement("span");
      label.className = "equipment-label";
      label.textContent = slot.name;

      const name = document.createElement("span");
      name.className = "equipment-name";
      name.textContent = item ? item.name : "فارغ";

      text.append(label, name);
      button.append(icon, text);

      button.addEventListener("click", () => {
        if (item) {
          selectedId = item.id;
          notice.textContent = `تم تحديد ${item.name}.`;
          render();
        } else if (selectedId && slotFor(getItem(selectedId)) === slot.id) {
          equip(selectedId, slot.id);
        }
      });

      button.addEventListener("dragover", event => {
        event.preventDefault();
      });

      button.addEventListener("drop", event => {
        event.preventDefault();
        const id = event.dataTransfer?.getData("text/plain");
        if (id) equip(id, slot.id);
      });

      equipmentGrid.appendChild(button);
    }

    $("#bag-defense").textContent = defense;
  }

  function renderHotbar() {
    const hotbarSlots = document.querySelectorAll(
      "#ew-new-hotbar .ew-hotbar-slot"
    );

    hotbarSlots.forEach((element, index) => {
      if (index >= 6) return;
      element.dataset.ewInventorySlot = String(index);
      element.addEventListener("dragover", event => event.preventDefault());
      element.addEventListener("drop", event => {
        event.preventDefault();
        const id = event.dataTransfer?.getData("text/plain");
        if (id) assignHotbar(index, id);
      });
      element.addEventListener("click", () => {
        const item = getItem(hotbar[index]);
        if (item) holdItem(item);
      });
    });
  }

  function render() {
    renderItems();
    renderEquipment();
    panel.querySelectorAll(".bag-tab").forEach(button => {
      button.classList.toggle("active", button.dataset.tab === activeTab);
    });
    if (previewRenderer) buildPreviewGear();
  }

  function equip(id, requestedSlot = null) {
    const item = getItem(id);
    if (!item) return false;

    const slotId = requestedSlot || slotFor(item);
    if (!slotId || !equipmentSlots.some(slot => slot.id === slotId)) {
      notice.textContent = "العنصر ده مش مناسب لخانة دروع الشخصية.";
      return false;
    }

    if (slotFor(item) !== slotId) {
      notice.textContent = "العنصر ده مش مناسب للخانة المختارة.";
      return false;
    }

    equipment[slotId] = item.id;
    selectedId = item.id;
    refreshEquippedGear();
    notice.textContent = `تم تجهيز ${item.name} وظهوره على الشخصية.`;
    render();
    return true;
  }

  function unequip(slotId) {
    const slot = equipmentSlots.find(entry => entry.id === slotId);
    if (!slot || !equipment[slotId]) return false;

    const item = getItem(equipment[slotId]);
    equipment[slotId] = null;
    if (item) selectedId = item.id;
    refreshEquippedGear();
    notice.textContent = item ? `تم خلع ${item.name}.` : "تم خلع المعدّة.";
    render();
    return true;
  }

  function assignHotbar(index, id) {
    const item = getItem(id);
    if (!item || !Number.isInteger(index) || index < 0 || index >= 6) return false;

    if (!["weapon", "tool"].includes(item.type)) {
      notice.textContent = "الشريط السريع مخصص للأدوات والأسلحة حاليًا.";
      return false;
    }

    hotbar[index] = item.id;
    save();
    selectedId = item.id;
    notice.textContent = `تم وضع ${item.name} في الخانة ${index + 1}.`;
    render();
    return true;
  }

  function open() {
    panel.classList.add("open");
    render();
    setupPreview();
    requestAnimationFrame(resizePreview);
  }

  function close() {
    panel.classList.remove("open");
    selectedId = null;
    notice.textContent = "";
  }

  $(".bag-close").addEventListener("click", close);
  $("#bag-close-bottom").addEventListener("click", close);

  panel.addEventListener("click", event => {
    if (event.target === panel) close();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") close();
  });

  document.addEventListener("ew:bag", open);
  window.addEventListener("resize", resizePreview);

  panel.querySelectorAll(".bag-tab").forEach(button => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab;
      selectedId = null;
      render();
    });
  });

  $("#bag-equip").addEventListener("click", () => {
    const item = getItem(selectedId);
    if (!item) return;

    if (["weapon", "tool"].includes(item.type)) {
      const emptyIndex = hotbar.findIndex(id => !id);
      if (emptyIndex === -1) {
        notice.textContent = "الشريط السريع ممتلئ. اسحب الأداة إلى خانة تريد استبدالها.";
        return;
      }
      assignHotbar(emptyIndex, item.id);
      return;
    }

    equip(item.id);
  });

  $("#bag-unequip").addEventListener("click", () => {
    const slot = equipmentSlots.find(entry => equipment[entry.id] === selectedId);
    if (slot) unequip(slot.id);
  });

  renderHotbar();
  refreshEquippedGear();
  render();

  const api = {
    open,
    close,

    getItems() {
      return items.map(item => ({ ...item }));
    },

    getEquipment() {
      return { ...equipment };
    },

    getHotbar() {
      return [...hotbar];
    },

    addItem(item, quantity = 1) {
      if (!item || typeof item.id !== "string" ||
          typeof item.name !== "string" ||
          !Number.isFinite(quantity) || quantity <= 0) {
        return false;
      }

      const existing = getItem(item.id);

      if (existing) {
        existing.quantity += quantity;
      } else {
        if (items.length >= 25) {
          notice.textContent = "الحقيبة ممتلئة (25 خانة).";
          return false;
        }

        const clean = safeItem({ ...item, quantity });
        if (!clean) return false;
        items.push(clean);
      }

      save();
      render();
      return true;
    },

    removeItem(id, quantity = 1) {
      const item = getItem(id);
      if (!item || !Number.isFinite(quantity) || quantity <= 0) return false;

      item.quantity -= quantity;

      if (item.quantity <= 0) {
        items = items.filter(entry => entry.id !== id);
        for (const slot of equipmentSlots) {
          if (equipment[slot.id] === id) equipment[slot.id] = null;
        }
        hotbar = hotbar.map(entry => entry === id ? null : entry);
        if (selectedId === id) selectedId = null;
        refreshEquippedGear();
      } else {
        save();
      }

      render();
      return true;
    },

    equip,
    unequip,

    assignHotbar,

    dispose() {
      close();
      window.removeEventListener("resize", resizePreview);
      document.removeEventListener("ew:bag", open);
      if (previewRenderer) {
        previewRenderer.dispose();
        previewRenderer.domElement.remove();
      }
      if (worldGear) {
        player.root.remove(worldGear);
        clearGroup(worldGear);
      }
      if (handTool) {
        player.root.remove(handTool);
        clearGroup(handTool);
      }
      panel.remove();
      style.remove();
    }
  };

  return api;
}
