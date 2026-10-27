
/* Everwild Survival
   واجهة التحكم وشريط الأدوات
   الإصدار الأول
*/

export function createGameControls() {
  // منع إنشاء الواجهة مرتين
  document.getElementById("ew-new-controls")?.remove();
  document.getElementById("ew-new-style")?.remove();

  const style = document.createElement("style");
  style.id = "ew-new-style";

  style.textContent = `
    #ew-new-controls {
      position: fixed;
      inset: 0;
      z-index: 1000;
      pointer-events: none;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      touch-action: none;
      font-family: Arial, sans-serif;
    }

    #ew-new-controls * {
      box-sizing: border-box;
    }

    #ew-top-buttons {
      position: absolute;
      top: max(10px, env(safe-area-inset-top));
      left: 10px;
      display: flex;
      gap: 7px;
      pointer-events: auto;
    }

    .ew-small-button {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border: 1px solid #ffffff55;
      border-radius: 11px;
      color: white;
      background: #101923b8;
      box-shadow: 0 3px 10px #0004;
      font-size: 20px;
      cursor: pointer;
      touch-action: manipulation;
    }

    #ew-new-controls button {
      -webkit-tap-highlight-color: transparent;
    }

    #ew-new-joystick {
      position: absolute;
      left: 18px;
      bottom: calc(24px + env(safe-area-inset-bottom));
      width: 96px;
      height: 96px;
      border: 2px solid #a6e9e080;
      border-radius: 50%;
      background: #102d39a8;
      box-shadow: inset 0 0 18px #0006, 0 4px 14px #0005;
      pointer-events: auto;
      touch-action: none;
    }

    #ew-new-stick {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 40px;
      height: 40px;
      transform: translate(-50%, -50%);
      border: 2px solid #ffffffdd;
      border-radius: 50%;
      background: linear-gradient(145deg, #b5fff0, #39a9a0);
      box-shadow: 0 2px 8px #0005;
      pointer-events: none;
    }

    #ew-new-actions {
      position: absolute;
      right: 15px;
      bottom: calc(25px + env(safe-area-inset-bottom));
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      pointer-events: auto;
    }

    .ew-action-button {
      width: 49px;
      height: 49px;
      display: grid;
      place-items: center;
      border: 1px solid #ffffffa0;
      border-radius: 50%;
      color: white;
      background: linear-gradient(145deg, #286778eF, #142b42ee);
      box-shadow: 0 3px 12px #0006;
      font-size: 23px;
      touch-action: none;
    }

    #ew-new-jump {
      width: 57px;
      height: 57px;
      background: linear-gradient(145deg, #e9c873, #95602a);
      font-size: 25px;
    }

    #ew-new-run.active {
      background: linear-gradient(145deg, #58b982, #21684e);
      box-shadow: 0 0 12px #5bffad65;
    }

    #ew-new-hotbar-wrap {
      position: absolute;
      left: 50%;
      bottom: calc(12px + env(safe-area-inset-bottom));
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 6px;
      max-width: calc(100vw - 150px);
      pointer-events: auto;
    }

    #ew-new-bag {
      flex: 0 0 39px;
      width: 39px;
      height: 43px;
      display: grid;
      place-items: center;
      border: 1px solid #8bdde4a0;
      border-radius: 9px;
      color: white;
      background: #10232feF;
      font-size: 21px;
    }

    #ew-new-hotbar {
      display: grid;
      grid-template-columns: repeat(6, minmax(29px, 43px));
      gap: 4px;
    }

    .ew-hotbar-slot {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      min-width: 0;
      padding: 0;
      display: grid;
      place-items: center;
      border: 1px solid #ffffff75;
      border-radius: 7px;
      color: white;
      background: #101923c9;
      box-shadow: 0 3px 9px #0005;
      font-size: 10px;
    }

    .ew-hotbar-slot.selected {
      border: 2px solid #71f5e5;
      background: #24515ac9;
      box-shadow: 0 0 10px #42e6d566;
    }

    .ew-slot-number {
      position: absolute;
      top: 2px;
      left: 4px;
      color: #ffffffb0;
      font-size: 9px;
    }

    #ew-new-interact {
      position: absolute;
      right: 83px;
      bottom: calc(108px + env(safe-area-inset-bottom));
      width: 49px;
      height: 49px;
      display: grid;
      place-items: center;
      border: 1px solid #ffffffa0;
      border-radius: 50%;
      color: white;
      background: #172e3ee8;
      box-shadow: 0 3px 12px #0006;
      font-size: 21px;
      pointer-events: auto;
      touch-action: manipulation;
    }

    @media (max-width: 430px) {
      #ew-new-joystick {
        left: 12px;
        width: 84px;
        height: 84px;
      }

      #ew-new-stick {
        width: 36px;
        height: 36px;
      }

      #ew-new-actions {
        right: 10px;
        gap: 8px;
      }

      .ew-action-button {
        width: 44px;
        height: 44px;
      }

      #ew-new-jump {
        width: 51px;
        height: 51px;
      }

      #ew-new-hotbar-wrap {
        gap: 4px;
        max-width: calc(100vw - 125px);
      }

      #ew-new-bag {
        flex-basis: 33px;
        width: 33px;
        height: 38px;
        font-size: 18px;
      }

      #ew-new-hotbar {
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 3px;
        flex: 1;
      }

      .ew-hotbar-slot {
        min-width: 25px;
        border-radius: 5px;
      }

      #ew-new-interact {
        right: 68px;
        bottom: calc(96px + env(safe-area-inset-bottom));
        width: 43px;
        height: 43px;
      }
    }

    @media (hover: hover) and (pointer: fine) {
      #ew-new-controls {
        display: none;
      }
    }
  `;

  document.head.appendChild(style);

  const controls = document.createElement("div");
  controls.id = "ew-new-controls";

  controls.innerHTML = `
    <div id="ew-top-buttons">
      <button class="ew-small-button"
        id="ew-fullscreen"
        type="button"
        aria-label="ملء الشاشة"
        title="ملء الشاشة">⛶</button>
    </div>

    <div id="ew-new-joystick"
      aria-label="عصا الحركة">
      <div id="ew-new-stick"></div>
    </div>

    <div id="ew-new-actions">
      <button class="ew-action-button"
        id="ew-new-run"
        type="button"
        aria-label="الجري">🏃</button>

      <button class="ew-action-button"
        id="ew-new-jump"
        type="button"
        aria-label="القفز">⬆</button>
    </div>

    <button id="ew-new-interact"
      type="button"
      aria-label="تفاعل">✋</button>

    <div id="ew-new-hotbar-wrap">
      <button id="ew-new-bag"
        type="button"
        aria-label="الشنطة"
        title="الشنطة">🎒</button>

      <div id="ew-new-hotbar">
        ${Array.from({ length: 6 }, (_, i) => `
          <button class="ew-hotbar-slot ${i === 0 ? "selected" : ""}"
            type="button"
            data-slot="${i + 1}"
            aria-label="الخانة ${i + 1}">
            <span class="ew-slot-number">${i + 1}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;

  document.body.appendChild(controls);

  const input = {
    x: 0,
    z: 0,
    run: false,
    jump: false,
    interact: false,
    selectedSlot: 1
  };

  const joystick = controls.querySelector("#ew-new-joystick");
  const stick = controls.querySelector("#ew-new-stick");
  const runButton = controls.querySelector("#ew-new-run");
  const jumpButton = controls.querySelector("#ew-new-jump");

  // عصا الحركة
  let pointerId = null;
  let centerX = 0;
  let centerY = 0;

  function moveStick(event) {
    const maxRadius = joystick.clientWidth * 0.34;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const distance = Math.hypot(dx, dy);
    const factor = distance > maxRadius
      ? maxRadius / distance
      : 1;

    const x = dx * factor;
    const y = dy * factor;

    stick.style.left = `calc(50% + ${x}px)`;
    stick.style.top = `calc(50% + ${y}px)`;

    input.x = x / maxRadius;
    input.z = y / maxRadius;
  }

  joystick.addEventListener("pointerdown", event => {
    event.preventDefault();

    pointerId = event.pointerId;

    const rect = joystick.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;

    joystick.setPointerCapture(event.pointerId);
    moveStick(event);
  });

  function releaseStick(event) {
    if (event.pointerId !== pointerId) return;

    pointerId = null;
    input.x = 0;
    input.z = 0;

    stick.style.left = "50%";
    stick.style.top = "50%";
  }

  joystick.addEventListener("pointermove", event => {
    if (event.pointerId === pointerId) moveStick(event);
  });

  joystick.addEventListener("pointerup", releaseStick);
  joystick.addEventListener("pointercancel", releaseStick);

  // الجري طالما الإصبع ضاغط
  runButton.addEventListener("pointerdown", event => {
    event.preventDefault();
    input.run = true;
    runButton.classList.add("active");
    runButton.setPointerCapture(event.pointerId);
  });

  function stopRun() {
    input.run = false;
    runButton.classList.remove("active");
  }

  runButton.addEventListener("pointerup", stopRun);
  runButton.addEventListener("pointercancel", stopRun);
  runButton.addEventListener("lostpointercapture", stopRun);

  // القفز
  jumpButton.addEventListener("pointerdown", event => {
    event.preventDefault();
    input.jump = true;
  });

  // اختيار الخانات
  const slots = [
    ...controls.querySelectorAll(".ew-hotbar-slot")
  ];

  function selectSlot(number) {
    if (number < 1 || number > 6) return;

    input.selectedSlot = number;

    slots.forEach(slot => {
      slot.classList.toggle(
        "selected",
        Number(slot.dataset.slot) === number
      );
    });
  }

  slots.forEach(slot => {
    slot.addEventListener("click", () => {
      selectSlot(Number(slot.dataset.slot));
    });
  });

  // الأرقام من 1 إلى 6 على الكمبيوتر
  function onKeyDown(event) {
    if (/^[1-6]$/.test(event.key)) {
      selectSlot(Number(event.key));
    }
  }

  window.addEventListener("keydown", onKeyDown);

  // ملء الشاشة
  const fullscreenButton =
    controls.querySelector("#ew-fullscreen");

  fullscreenButton.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        const target = document.documentElement;

        if (target.requestFullscreen) {
          await target.requestFullscreen();
        } else {
          fullscreenButton.title =
            "المتصفح لا يدعم ملء الشاشة من هنا";
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn("تعذر تفعيل ملء الشاشة:", error);
    }
  });

  function updateFullscreenButton() {
    fullscreenButton.textContent =
      document.fullscreenElement ? "⛶" : "⛶";

    fullscreenButton.title =
      document.fullscreenElement
        ? "الخروج من ملء الشاشة"
        : "ملء الشاشة";
  }

  document.addEventListener(
    "fullscreenchange",
    updateFullscreenButton
  );

  // واجهة عامة لربط الأزرار بحركة الشخصية لاحقًا
  window.EWControls = {
    input,

    get selectedSlot() {
      return input.selectedSlot;
    },

    selectSlot,

    consumeJump() {
      const value = input.jump;
      input.jump = false;
      return value;
    },

    consumeInteract() {
      const value = input.interact;
      input.interact = false;
      return value;
    },

    dispose() {
      window.removeEventListener("keydown", onKeyDown);

      document.removeEventListener(
        "fullscreenchange",
        updateFullscreenButton
      );

      controls.remove();
      style.remove();

      delete window.EWControls;
    }
  };

  controls.querySelector("#ew-new-interact")
    .addEventListener("click", () => {
      input.interact = true;
    });

  // الشنطة والشريط جاهزان للربط بنظام المخزون لاحقًا
  controls.querySelector("#ew-new-bag")
    .addEventListener("click", () => {
      controls.dispatchEvent(
        new CustomEvent("ew:bag", { bubbles: true })
      );
    });

  return window.EWControls;
}
