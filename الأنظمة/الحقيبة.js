 // Everwild Survival — حقيبة اللاعب والمعدات
 // مخزون أولي قابل للربط بجمع الموارد والتصنيع.

export function createInventory(THREE, controls, player) {
  if (!THREE || !controls || !player) {
    throw new Error("بيانات إنشاء الحقيبة غير مكتملة.");
  }

  document.getElementById("ew-inventory-style")?.remove();
  document.getElementById("ew-inventory")?.remove();

  const STORAGE_KEY = "everwild_inventory_v1";

  const slots = [
    { id: "head", name: "الخوذة", icon: "🪖", type: "armor" },
    { id: "chest", name: "درع الصدر", icon: "🦺", type: "armor" },
    { id: "hands", name: "القفازات", icon: "🧤", type: "armor" },
    { id: "legs", name: "درع الساقين", icon: "👖", type: "armor" },
    { id: "feet", name: "الحذاء", icon: "🥾", type: "armor" },
    { id: "back", name: "الظهر", icon: "🎒", type: "equipment" },
    { id: "weapon", name: "السلاح الرئيسي", icon: "⚔️", type: "weapon" },
    { id: "offhand", name: "اليد الثانية", icon: "🛡️", type: "weapon" }
  ];

  let items = [];
  let equipment = {};
  let selectedId = null;
  let activeTab = "all";
  let previewRenderer = null;
  let previewScene = null;
  let previewCamera = null;
  let previewModel = null;

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

      if (saved && Array.isArray(saved.items)) {
        items = saved.items.filter(item =>
          item && typeof item.id === "string" &&
          typeof item.name === "string" &&
          Number(item.quantity) > 0
        );
        equipment = saved.equipment || {};
      }
    } catch (error) {
      console.warn("تعذر تحميل الحقيبة:", error);
    }

    for (const slot of slots) {
      if (!equipment[slot.id]) equipment[slot.id] = null;
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        items,
        equipment
      }));
    } catch (error) {
      console.warn("تعذر حفظ الحقيبة:", error);
    }
  }

  load();

  const style = document.createElement("style");
  style.id = "ew-inventory-style";
  style.textContent = `
    #ew-inventory {
      position: fixed;
      inset: 0;
      z-index: 3000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 10px;
      color: #eef8ff;
      font-family: Arial, sans-serif;
      direction: rtl;
      background: #030811d9;
      backdrop-filter: blur(9px);
    }

    #ew-inventory.open { display: flex; }
    #ew-inventory * { box-sizing: border-box; }

    #ew-inventory .bag-panel {
      width: min(950px, 100%);
      max-height: 94dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #3d7581;
      border-radius: 17px;
      background: linear-gradient(145deg, #172a39, #09121e);
      box-shadow: 0 20px 70px #000b;
    }

    #ew-inventory button {
      color: inherit;
      font: inherit;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    #ew-inventory .bag-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 13px;
      background: #142634;
      border-bottom: 1px solid #ffffff17;
    }

    #ew-inventory .bag-title {
      font-size: 18px;
      font-weight: bold;
    }

    #ew-inventory .bag-subtitle {
      margin-top: 5px;
      color: #9bbbc9;
      font-size: 11px;
    }

    #ew-inventory .bag-close {
      width: 38px;
      height: 38px;
      border: 1px solid #456779;
      border-radius: 10px;
      background: #203746;
      font-size: 23px;
    }

    #ew-inventory .bag-tabs {
      display: flex;
      gap: 6px;
      padding: 9px;
      overflow-x: auto;
    }

    #ew-inventory .bag-tab {
      flex: 1;
      min-width: 68px;
      padding: 10px 6px;
      border: 1px solid #304b5c;
      border-radius: 9px;
      background: #122330;
      color: #b6cbd7;
      font-size: 12px;
    }

    #ew-inventory .bag-tab.active {
      border-color: #5ce3d1;
      background: #17464a;
      color: white;
    }

    #ew-inventory .bag-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 10px;
      overflow: auto;
      min-height: 0;
    }

    #ew-inventory .bag-card {
      min-width: 0;
      padding: 10px;
      border: 1px solid #2b4557;
      border-radius: 12px;
      background: #0e1b28;
    }

    #ew-inventory .bag-heading {
      display: flex;
      justify-content: space-between;
      gap: 6px;
      margin-bottom: 10px;
      font-size: 13px;
      font-weight: bold;
    }

    #ew-inventory .bag-count {
      color: #91b1c1;
      font-size: 10px;
      font-weight: normal;
    }

    #ew-inventory .bag-items {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 6px;
    }

    #ew-inventory .bag-item {
      position: relative;
      display: flex;
      min-width: 0;
      min-height: 69px;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 6px 2px;
      border: 1px solid #354e60;
      border-radius: 9px;
      background: #182a39;
      overflow-wrap: anywhere;
      font-size: 10px;
    }

    #ew-inventory .bag-item.selected {
      border: 2px solid #64e7d6;
      background: #19444b;
      box-shadow: 0 0 12px #42d9d344;
    }

    #ew-inventory .bag-icon { font-size: 23px; }

    #ew-inventory .bag-qty {
      position: absolute;
      top: 3px;
      left: 4px;
      color: #a5fff1;
      font-size: 10px;
    }

    #ew-inventory .bag-empty {
      grid-column: 1 / -1;
      padding: 24px 7px;
      text-align: center;
      color: #819bab;
      font-size: 12px;
    }

    #ew-inventory .bag-preview {
      position: relative;
      height: 210px;
      margin-bottom: 10px;
      overflow: hidden;
      border: 1px solid #2c4a5d;
      border-radius: 10px;
      background: radial-gradient(ellipse, #294e5d, #101a27 75%);
    }

    #ew-inventory .bag-preview canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    #ew-inventory .bag-preview-label {
      position: absolute;
      right: 5px;
      bottom: 6px;
      left: 5px;
      text-align: center;
      color: #b9d7e3;
      font-size: 10px;
      pointer-events: none;
      text-shadow: 0 2px 4px black;
    }

    #ew-inventory .equipment-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }

    #ew-inventory .equipment-slot {
      display: flex;
      align-items: center;
      gap: 7px;
      min-width: 0;
      min-height: 57px;
      padding: 7px;
      text-align: right;
      border: 1px solid #354f60;
      border-radius: 9px;
      background: #182a39;
    }

    #ew-inventory .equipment-slot.filled {
      border-color: #61b8aa;
      background: #18373b;
    }

    #ew-inventory .equipment-icon {
      flex: 0 0 27px;
      font-size: 22px;
      text-align: center;
    }

    #ew-inventory .equipment-label {
      margin-bottom: 4px;
      color: #92afbf;
      font-size: 10px;
    }

    #ew-inventory .equipment-name {
      font-size: 10px;
      overflow-wrap: anywhere;
    }

    #ew-inventory .bag-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5px;
      margin-top: 9px;
    }

    #ew-inventory .bag-stat {
      padding: 8px 3px;
      border-radius: 8px;
      background: #182a39;
      text-align: center;
      color: #9bb7c6;
      font-size: 10px;
    }

    #ew-inventory .bag-stat strong {
      display: block;
      margin-top: 5px;
      color: white;
      font-size: 12px;
    }

    #ew-inventory .bag-actions {
      display: flex;
      gap: 7px;
      padding: 9px;
      border-top: 1px solid #ffffff16;
    }

    #ew-inventory .bag-action {
      flex: 1;
      min-height: 39px;
      padding: 7px 4px;
      border: 1px solid #426777;
      border-radius: 9px;
      background: #193746;
      font-size: 11px;
    }

    #ew-inventory .bag-action.primary {
      border-color: #53cbbb;
      background: #17635d;
    }

    #ew-inventory .bag-action:disabled {
      opacity: .4;
      cursor: default;
    }

    #ew-inventory .bag-notice {
      min-height: 25px;
      padding: 0 12px 8px;
      color: #91e0d5;
      font-size: 11px;
    }

    @media(max-width: 600px) {
      #ew-inventory { padding: 6px; }
      #ew-inventory .bag-panel { max-height: 95dvh; }
      #ew-inventory .bag-content {
        grid-template-columns: 1fr;
        gap: 8px;
        padding: 7px;
      }
      #ew-inventory .bag-preview { height: 180px; }
      #ew-inventory .bag-header { padding: 10px; }
      #ew-inventory .bag-title { font-size: 16px; }
      #ew-inventory .bag-actions { padding: 7px; }
    }
  `;

  document.head.appendChild(style);

  const panel = document.createElement("div");
  panel.id = "ew-inventory";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");

  panel.innerHTML = `
    <section class="bag-panel">
      <header class="bag-header">
        <div>
          <div class="bag-title">🎒 حقيبة الناجي</div>
          <div class="bag-subtitle">المخزون والأسلحة والدروع والمعدات</div>
        </div>
        <button class="bag-close" type="button" aria-label="إغلاق">×</button>
      </header>

      <nav class="bag-tabs">
        <button class="bag-tab active" data-tab="all">الحقيبة</button>
        <button class="bag-tab" data-tab="equipment">المعدات</button>
        <button class="bag-tab" data-tab="weapon">الأسلحة</button>
        <button class="bag-tab" data-tab="armor">الدروع</button>
      </nav>

      <div class="bag-content">
        <section class="bag-card">
          <div class="bag-heading">
            <span id="bag-section-title">محتويات الحقيبة</span>
            <span class="bag-count" id="bag-count">0 عنصر</span>
          </div>
          <div class="bag-items" id="bag-items"></div>
        </section>

        <section class="bag-card">
          <div class="bag-heading">
            <span>شخصيتك ومعداتك</span>
            <span class="bag-count">معاينة</span>
          </div>

          <div class="bag-preview" id="bag-preview">
            <div class="bag-preview-label">شخصيتك داخل العالم</div>
          </div>

          <div class="equipment-grid" id="bag-equipment"></div>

          <div class="bag-stats">
            <div class="bag-stat">الحماية<strong id="bag-defense">0</strong></div>
            <div class="bag-stat">السلاح<strong id="bag-weapon">لا يوجد</strong></div>
            <div class="bag-stat">الأغراض<strong id="bag-total">0</strong></div>
          </div>
        </section>
      </div>

      <div class="bag-actions">
        <button class="bag-action primary" id="bag-equip" disabled>تجهيز العنصر</button>
        <button class="bag-action" id="bag-unequip" disabled>خلع المعدّة</button>
        <button class="bag-action" id="bag-close-bottom">رجوع للعالم</button>
      </div>

      <div class="bag-notice" id="bag-notice" aria-live="polite"></div>
    </section>
  `;

  document.body.appendChild(panel);

  const $ = selector => panel.querySelector(selector);
  const itemGrid = $("#bag-items");
  const equipmentGrid = $("#bag-equipment");
  const notice = $("#bag-notice");

  function slotFor(item) {
    if (!item) return null;

    if (item.slot && slots.some(slot => slot.id === item.slot)) {
      return item.slot;
    }

    if (item.type === "weapon") return "weapon";
    if (item.type === "shield") return "offhand";
    if (item.type === "armor") return "chest";
    if (item.type === "backpack") return "back";

    return null;
  }

  function renderItems() {
    let shown = items;

    if (activeTab === "weapon") {
      shown = items.filter(item =>
        item.type === "weapon" || item.type === "shield"
      );
    }

    if (activeTab === "armor") {
      shown = items.filter(item => item.type === "armor");
    }

    if (activeTab === "equipment") {
      shown = items.filter(item => slotFor(item));
    }

    $("#bag-section-title").textContent = {
      all: "محتويات الحقيبة",
      equipment: "المعدات",
      weapon: "الأسلحة",
      armor: "الدروع"
    }[activeTab];

    $("#bag-count").textContent =
      shown.reduce((sum, item) => sum + item.quantity, 0) + " عنصر";

    $("#bag-total").textContent =
      items.reduce((sum, item) => sum + item.quantity, 0);

    itemGrid.innerHTML = "";

    if (!shown.length) {
      const empty = document.createElement("div");
      empty.className = "bag-empty";
      empty.textContent = activeTab === "weapon"
        ? "لا توجد أسلحة حاليًا."
        : activeTab === "armor"
        ? "لا توجد دروع حاليًا."
        : "الحقيبة فارغة حاليًا. ستظهر الموارد هنا عند جمعها.";
      itemGrid.appendChild(empty);
    }

    for (const item of shown) {
      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "bag-item" + (item.id === selectedId ? " selected" : "");

      const icon = document.createElement("span");
      icon.className = "bag-icon";
      icon.textContent = item.icon || "📦";

      const quantity = document.createElement("span");
      quantity.className = "bag-qty";
      quantity.textContent = "×" + item.quantity;

      const name = document.createElement("span");
      name.textContent = item.name;

      button.append(quantity, icon, name);

      button.addEventListener("click", () => {
        selectedId = item.id;
        notice.textContent = slotFor(item)
          ? item.name + " — يمكن تجهيزه."
          : item.name + " — مورد داخل الحقيبة.";
        render();
      });

      itemGrid.appendChild(button);
    }

    const selected = items.find(item => item.id === selectedId);
    $("#bag-equip").disabled = !selected || !slotFor(selected);
  }

  function renderEquipment() {
    equipmentGrid.innerHTML = "";
    let defense = 0;

    for (const slot of slots) {
      const id = equipment[slot.id];
      const item = items.find(entry => entry.id === id);

      if (item && item.type === "armor") {
        defense += Number(item.defense || 0);
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "equipment-slot" + (item ? " filled" : "");

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
        if (!item) return;
        selectedId = item.id;
        notice.textContent = "تم تحديد " + item.name + ".";
        render();
      });

      equipmentGrid.appendChild(button);
    }

    $("#bag-defense").textContent = defense;

    const weapon = items.find(item => item.id === equipment.weapon);
    $("#bag-weapon").textContent = weapon ? weapon.name : "لا يوجد";

    $("#bag-unequip").disabled =
      !slots.some(slot => equipment[slot.id] === selectedId);
  }

  function render() {
    renderItems();
    renderEquipment();

    panel.querySelectorAll(".bag-tab").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.tab === activeTab
      );
    });
  }

  function setupPreview() {
    const host = $("#bag-preview");

    if (previewRenderer) return;

    try {
      // يستخدم نسخة من مجسم اللاعب، دون إضافة شخصية جديدة للعالم.
      if (!player.root || typeof player.root.clone !== "function") {
        host.querySelector(".bag-preview-label").textContent =
          "معاينة الشخصية تحتاج مجسم اللاعب";
        return;
      }

      previewScene = new THREE.Scene();
      previewScene.background = new THREE.Color(0x132532);

      previewScene.add(
        new THREE.HemisphereLight(0xdaf1ff, 0x34413c, 2)
      );

      const light = new THREE.DirectionalLight(0xffe5c0, 2.2);
      light.position.set(-3, 6, 4);
      previewScene.add(light);

      previewModel = player.root.clone(true);
      previewModel.position.set(0, 0, 0);
      previewModel.rotation.y = Math.PI;
      previewScene.add(previewModel);

      previewCamera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      previewCamera.position.set(0, 1.45, 5.6);
      previewCamera.lookAt(0, 1.05, 0);

      previewRenderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "low-power"
      });

      previewRenderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.25)
      );

      previewRenderer.outputColorSpace = THREE.SRGBColorSpace;
      host.prepend(previewRenderer.domElement);
      resizePreview();
    } catch (error) {
      console.warn("تعذرت معاينة الشخصية:", error);
      host.querySelector(".bag-preview-label").textContent =
        "تعذرت معاينة الشخصية على هذا الجهاز";
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
    const item = items.find(entry => entry.id === selectedId);
    const slot = slotFor(item);

    if (!item || !slot) return;

    const currentId = equipment[slot];

    if (currentId && currentId !== item.id) {
      notice.textContent = "اخلع المعدّة الموجودة في الخانة أولًا.";
      return;
    }

    equipment[slot] = item.id;
    notice.textContent = "تم تجهيز " + item.name + ".";

    save();
    render();
  });

  $("#bag-unequip").addEventListener("click", () => {
    const slot = slots.find(entry =>
      equipment[entry.id] === selectedId
    );

    if (!slot) return;

    const item = items.find(entry => entry.id === selectedId);
    equipment[slot.id] = null;

    notice.textContent = item
      ? "تم خلع " + item.name + "."
      : "تم خلع المعدّة.";

    save();
    render();
  });

  // واجهة الربط التي ستستخدمها أنظمة جمع الموارد والتصنيع.
  const api = {
    open,
    close,

    getItems() {
      return items.map(item => ({ ...item }));
    },

    getEquipment() {
      return { ...equipment };
    },

    addItem(item, quantity = 1) {
      if (
        !item ||
        typeof item.id !== "string" ||
        typeof item.name !== "string" ||
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) return false;

      const existing = items.find(entry => entry.id === item.id);

      if (existing) {
        existing.quantity += quantity;
      } else {
        items.push({
          id: item.id,
          name: item
