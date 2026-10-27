
 // Everwild Survival — Cartoon Character Module
 // Version: 1.0.0
 // ملف الشخصية مستقل عن ملف العالم.

export function createCharacter(THREE, scene, options = {}) {
  if (!THREE || !scene) {
    throw new Error("createCharacter يحتاج THREE و scene.");
  }

  const getGroundHeight =
    typeof options.getGroundHeight === "function"
      ? options.getGroundHeight
      : () => 0;

  const worldLimit = options.worldLimit ?? 108;

  const root = new THREE.Group();
  root.name = "Everwild_Player";
  scene.add(root);

  const body = new THREE.Group();
  root.add(body);

  const material = (color, roughness = 0.8) =>
    new THREE.MeshStandardMaterial({ color, roughness });

  const skin = material(0xe8ad7e);
  const hair = material(0x493126);
  const shirt = material(0x27877f);
  const shirtLight = material(0x48b5a7);
  const trousers = material(0x34445f);
  const boots = material(0x49352c);
  const pack = material(0xc77c38);
  const trim = material(0xe6c56d);
  const eyeWhite = material(0xfff4e7);
  const eyes = material(0x304b50);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x17231a,
    transparent: true,
    opacity: 0.22,
    depthWrite: false
  });

  const sphere = new THREE.SphereGeometry(1, 20, 16);

  function ball(parent, mat, pos, scale) {
    const mesh = new THREE.Mesh(sphere, mat);
    mesh.position.set(...pos);
    mesh.scale.set(...scale);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function capsule(parent, mat, radius, length, pos) {
    const mesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(radius, length, 4, 10),
      mat
    );
    mesh.position.set(...pos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  function box(parent, mat, size, pos) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(...size),
      mat
    );
    mesh.position.set(...pos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  const startX = options.x ?? 0;
  const startZ = options.z ?? 0;

  root.position.set(
    startX,
    getGroundHeight(startX, startZ) + 0.03,
    startZ
  );

  // ظل الشخصية
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.52, 28),
    shadowMaterial
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.025;
  shadow.scale.set(1, 0.58, 1);
  root.add(shadow);

  // حقيبة الظهر
  const backpack = new THREE.Group();
  backpack.position.set(0, 1.22, -0.28);
  body.add(backpack);

  box(backpack, pack, [0.42, 0.55, 0.24], [0, 0, 0]);
  box(backpack, trim, [0.27, 0.045, 0.035], [0, 0.13, 0.14]);
  box(backpack, material(0x75472c), [0.3, 0.16, 0.05], [0, -0.12, 0.14]);

  // الجذع
  const torso = new THREE.Group();
  torso.position.y = 1.22;
  body.add(torso);

  capsule(torso, shirt, 0.27, 0.35, [0, 0, 0]);
  ball(torso, shirtLight, [0, 0.16, 0], [0.23, 0.13, 0.19]);
  box(torso, trim, [0.12, 0.09, 0.035], [0, -0.2, 0.22]);

  // الرأس
  const head = new THREE.Group();
  head.position.set(0, 1.78, 0.02);
  body.add(head);

  ball(head, skin, [0, 0.08, 0], [0.29, 0.32, 0.27]);
  ball(head, hair, [0, 0.29, -0.015], [0.3, 0.17, 0.27]);
  ball(head, hair, [0.07, 0.23, 0.19], [0.17, 0.09, 0.12]);

  for (const side of [-1, 1]) {
    ball(
      head, skin,
      [side * 0.285, 0.06, 0],
      [0.065, 0.09, 0.065]
    );

    ball(
      head, eyeWhite,
      [side * 0.105, 0.09, 0.228],
      [0.068, 0.083, 0.035]
    );

    ball(
      head, eyes,
      [side * 0.1, 0.085, 0.259],
      [0.034, 0.046, 0.018]
    );

    ball(
      head, hair,
      [side * 0.11, 0.19, 0.235],
      [0.07, 0.018, 0.02]
    );
  }

  ball(head, skin, [0, 0.025, 0.265], [0.04, 0.045, 0.035]);

  // الذراعان
  const arms = [];

  for (const side of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.29, 1.39, 0);
    body.add(pivot);

    capsule(pivot, shirt, 0.095, 0.23, [0, -0.14, 0]);
    capsule(pivot, skin, 0.075, 0.22, [0, -0.41, 0.015]);
    ball(pivot, skin, [0, -0.56, 0.025], [0.08, 0.085, 0.075]);

    arms.push({ pivot, side });
  }

  // الساقان والحذاء
  const legs = [];

  for (const side of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.14, 0.89, 0);
    body.add(hip);

    capsule(hip, trousers, 0.115, 0.27, [0, -0.17, 0]);
    capsule(hip, trousers, 0.09, 0.25, [0, -0.44, 0.015]);
    box(hip, boots, [0.18, 0.09, 0.25], [0, -0.62, 0.07]);
    box(hip, trim, [0.12, 0.022, 0.018], [0, -0.59, 0.2]);

    legs.push({ hip, side });
  }

  // عصا التحكم وأزرار الحركة
  const style = document.createElement("style");
  style.textContent = `
    #ew-controls {
      position: fixed;
      inset: 0;
      z-index: 20;
      pointer-events: none;
      touch-action: none;
      user-select: none;
    }
    #ew-joystick {
      position: absolute;
      left: 24px;
      bottom: 28px;
      width: 108px;
      height: 108px;
      border-radius: 50%;
      border: 2px solid #ffffff70;
      background: #203c45a8;
      box-shadow: inset 0 0 18px #0005, 0 4px 14px #0004;
      pointer-events: auto;
      touch-action: none;
    }
    #ew-stick {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 46px;
      height: 46px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      border: 2px solid white;
      background: linear-gradient(145deg, #e4f5e9, #80bca6);
    }
    #ew-actions {
      position: absolute;
      right: 22px;
      bottom: 30px;
      display: flex;
      gap: 12px;
      align-items: flex-end;
      pointer-events: auto;
    }
    #ew-actions button {
      width: 60px;
      height: 60px;
      border: 2px solid #ffffffa8;
      border-radius: 50%;
      color: white;
      font-size: 25px;
      background: linear-gradient(145deg, #347d83, #17384d);
      box-shadow: 0 4px 14px #0005;
      touch-action: none;
    }
    #ew-actions #ew-jump {
      width: 70px;
      height: 70px;
      background: linear-gradient(145deg, #e7c46c, #a66b28);
    }
        #ew-status {
  position: fixed;
  top: max(10px, env(safe-area-inset-top));
  right: 12px;
  display: flex;
  flex-direction: row;
  gap: 6px;
  pointer-events: none;
  z-index: 21;
}

    .ew-stat {
      position: relative;
      width: 43px;
      height: 43px;
      border-radius: 50%;
      background: #101923c9;
      border: 1px solid #ffffff35;
      box-shadow: 0 3px 12px #0005;
      display: grid;
      place-items: center;
    }

    .ew-stat svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .ew-stat circle {
      fill: none;
      stroke-width: 4;
    }

    .ew-stat .ew-track {
      stroke: #ffffff20;
    }

    .ew-stat .ew-ring {
      stroke-dasharray: 100;
      stroke-dashoffset: 0;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.2s linear;
    }

    .ew-stat-icon {
      font-size: 19px;
      line-height: 1;
      filter: drop-shadow(0 1px 2px #000);
    }

    .ew-stat.low {
      animation: ew-warning 1s ease-in-out infinite;
    }

    @keyframes ew-warning {
      50% { box-shadow: 0 0 12px currentColor; }
    }

    @media (max-width: 380px) {
  #ew-status {
    top: max(8px, env(safe-area-inset-top));
    right: 8px;
    gap: 5px;
  }

  .ew-stat {
    width: 34px;
    height: 34px;
  }

  .ew-stat-icon {
    font-size: 15px;
  }
}

    @media (hover:hover) and (pointer:fine) {
      #ew-controls { display:none; }
    }
    @media (max-width:380px) {
      #ew-joystick { width:92px; height:92px; }
      #ew-stick { width:40px; height:40px; }
      #ew-actions button { width:52px; height:52px; }
      #ew-actions #ew-jump { width:62px; height:62px; }
    }
  `;

  document.head.appendChild(style);

  const controls = document.createElement("div");
  controls.id = "ew-controls";
    
controls.innerHTML = `
  <div id="ew-status">
    <div class="ew-stat" data-stat="health" style="color:#ff4b55">
      <svg viewBox="0 0 100 100">
        <circle class="ew-track" cx="50" cy="50" r="44"/>
        <circle class="ew-ring" cx="50" cy="50" r="44" stroke="#ff4b55"/>
      </svg>
      <span class="ew-stat-icon">❤️</span>
    </div>

    <div class="ew-stat" data-stat="stamina" style="color:#8eea59">
      <svg viewBox="0 0 100 100">
        <circle class="ew-track" cx="50" cy="50" r="44"/>
        <circle class="ew-ring" cx="50" cy="50" r="44" stroke="#8eea59"/>
      </svg>
      <span class="ew-stat-icon">⚡</span>
    </div>

    <div class="ew-stat" data-stat="food" style="color:#ffad42">
      <svg viewBox="0 0 100 100">
        <circle class="ew-track" cx="50" cy="50" r="44"/>
        <circle class="ew-ring" cx="50" cy="50" r="44" stroke="#ffad42"/>
      </svg>
      <span class="ew-stat-icon">🍖</span>
    </div>

    <div class="ew-stat" data-stat="water" style="color:#43baff">
      <svg viewBox="0 0 100 100">
        <circle class="ew-track" cx="50" cy="50" r="44"/>
        <circle class="ew-ring" cx="50" cy="50" r="44" stroke="#43baff"/>
      </svg>
      <span class="ew-stat-icon">💧</span>
    </div>
  </div>
`;

  document.body.appendChild(controls);


    const input = options.controls?.input ?? {
  x: 0,
  z: 0,
  run: false,
  jump: false
};

  const statusValues = {
    health: 100,
    stamina: 100,
    food: 100,
    water: 100
  };

  const statusElements = {};

  for (const name of Object.keys(statusValues)) {
    const element = controls.querySelector(
      `[data-stat="${name}"]`
    );

    statusElements[name] = {
      element,
      ring: element.querySelector(".ew-ring")
    };
  }

  function updateStatusUI() {
    for (const [name, value] of Object.entries(statusValues)) {
      const item = statusElements[name];
      const amount = THREE.MathUtils.clamp(value, 0, 100);

            const circumference = 2 * Math.PI * 44;

      item.ring.style.strokeDasharray = String(circumference);
      item.ring.style.strokeDashoffset = String(
        circumference * (1 - amount / 100)
      );

      item.element.classList.toggle("low", amount <= 25);
    }
  }

  updateStatusUI();

  
  // واجهة الأزرار الجديدة تتولى العصا والجري والقفز.
  // نحتفظ بلوحة المفاتيح الموجودة أسفل هذا الجزء.


  // دعم الكمبيوتر أثناء التطوير
  const keys = new Set();

  function onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright","shift"," "].includes(key)) {
      event.preventDefault();
      keys.add(key);
    }
    if (key === " " && !event.repeat) input.jump = true;
  }

  function onKeyUp(event) {
    keys.delete(event.key.toLowerCase());
  }

  window.addEventListener("keydown", onKeyDown, { passive: false });
  window.addEventListener("keyup", onKeyUp);

  let verticalVelocity = 0;
  let grounded = true;
  let walkTime = 0;
  let disposed = false;

    const walkSpeed = 3.1;
  const runSpeed = 8.25;
  const jumpSpeed = 5.2;
  const gravity = 14.5;

  let sprintLocked = false;
  let survivalTime = 0;

  function update(deltaTime) {
    if (disposed) return null;

    const dt = Math.max(0, Math.min(deltaTime || 0, 0.05));

    let x = input.x;
    let z = input.z;

    if (keys.has("a") || keys.has("arrowleft")) x -= 1;
    if (keys.has("d") || keys.has("arrowright")) x += 1;
    if (keys.has("w") || keys.has("arrowup")) z -= 1;
    if (keys.has("s") || keys.has("arrowdown")) z += 1;

    const length = Math.hypot(x, z);
    if (length > 1) {
      x /= length;
      z /= length;
    }

        const moving = Math.hypot(x, z) > 0.08;
    const wantsRun = input.run || keys.has("shift");

    if (statusValues.stamina <= 0) {
      statusValues.stamina = 0;
      sprintLocked = true;
    }

    if (sprintLocked && statusValues.stamina >= 25) {
      sprintLocked = false;
    }

    const running = moving && wantsRun &&
      !sprintLocked && statusValues.stamina > 0;

    if (running) {
      statusValues.stamina = Math.max(
        0, statusValues.stamina - dt * 10
      );

      if (statusValues.stamina <= 0) {
        sprintLocked = true;
      }
    } else if (!moving) {
      statusValues.stamina = Math.min(
        100, statusValues.stamina + dt * 20
      );
    }

    const speed = running ? runSpeed : walkSpeed;

    if (moving) {
      const angle =
        typeof options.getCameraAngle === "function"
          ? options.getCameraAngle()
          : 0;

      const moveX = x * Math.cos(angle) + z * Math.sin(angle);
      const moveZ = -x * Math.sin(angle) + z * Math.cos(angle);

      root.position.x += moveX * speed * dt;
      root.position.z += moveZ * speed * dt;

      root.position.x = THREE.MathUtils.clamp(
        root.position.x, -worldLimit, worldLimit
      );
      root.position.z = THREE.MathUtils.clamp(
        root.position.z, -worldLimit, worldLimit
      );

      const targetRotation = Math.atan2(moveX, moveZ);
      const rotationDifference = Math.atan2(
        Math.sin(targetRotation - root.rotation.y),
        Math.cos(targetRotation - root.rotation.y)
      );

      root.rotation.y += rotationDifference * Math.min(1, dt * 10);

      walkTime += dt * (running ? 12 : 8);
    }

    survivalTime += dt;

    if (survivalTime >= 60) {
      survivalTime = 0;
      statusValues.food = Math.max(0, statusValues.food - 1);
      statusValues.water = Math.max(0, statusValues.water - 1.5);
    }

    updateStatusUI();
    const groundY = getGroundHeight(root.position.x, root.position.z);

    const jumpPressed = options.controls?.consumeJump
  ? options.controls.consumeJump()
  : input.jump;

if (jumpPressed && grounded) {
  verticalVelocity = jumpSpeed;
  grounded = false;
}

if (!options.controls?.consumeJump) {
  input.jump = false;
}

    if (!grounded) {
      verticalVelocity -= gravity * dt;
      root.position.y += verticalVelocity * dt;

      if (root.position.y <= groundY + 0.03) {
        root.position.y = groundY + 0.03;
        verticalVelocity = 0;
        grounded = true;
      }
    } else {
      root.position.y = groundY + 0.03;
    }

    const stride = moving ? Math.sin(walkTime) : 0;
    const blend = Math.min(1, dt * 12);

    for (const { hip, side } of legs) {
      const target = moving ? stride * (running ? 0.65 : 0.45) * side : 0;
      hip.rotation.x += (target - hip.rotation.x) * blend;
    }

    for (const { pivot, side } of arms) {
      const target = moving ? -stride * (running ? 0.6 : 0.4) * side : 0;
      pivot.rotation.x += (target - pivot.rotation.x) * blend;
    }

    body.position.y = moving && grounded ? Math.abs(stride) * 0.035 : 0;
    body.rotation.z += (
      (moving && grounded ? Math.sin(walkTime * 0.5) * 0.025 : 0)
      - body.rotation.z
    ) * blend;

    shadow.scale.set(grounded ? 1 : 0.72, grounded ? 0.58 : 0.42, 1);
    shadowMaterial.opacity = grounded ? 0.22 : 0.12;

    return {
      position: root.position,
      moving,
      running,
      grounded,
      airborne: !grounded
    };
  }

  function dispose() {
    if (disposed) return;
    disposed = true;

    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
   options.controls?.dispose?.();

    controls.remove();
    style.remove();
    scene.remove(root);

    root.traverse(object => {
      if (object.geometry) object.geometry.dispose();
    });

    const materials = new Set();
    root.traverse(object => {
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(item => materials.add(item));
        } else {
          materials.add(object.material);
        }
      }
    });
    materials.forEach(item => item.dispose());

    for (const item of [
      skin, hair, shirt, shirtLight, trousers, boots, pack,
      trim, eyeWhite, eyes, shadowMaterial
    ]) item.dispose();
  }

  return {
    root,
    update,
    dispose,
    get position() { return root.position; },
    get grounded() { return grounded; }
  };
}
