/** Live background + glass card tilt */

export function initAmbient() {
  initMeshParallax();
  initCardMotion();
}

function initMeshParallax() {
  const mesh = document.getElementById("bg-mesh");
  if (!mesh || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let px = 0;
  let py = 0;
  let tx = 0;
  let ty = 0;
  let raf = 0;

  const tick = () => {
    px += (tx - px) * 0.06;
    py += (ty - py) * 0.06;
    mesh.style.setProperty("--parallax-x", `${px}px`);
    mesh.style.setProperty("--parallax-y", `${py}px`);
    const shapes = document.getElementById("bg-shapes");
    if (shapes) {
      shapes.style.setProperty("--parallax-x", `${px * 0.5}px`);
      shapes.style.setProperty("--parallax-y", `${py * 0.5}px`);
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  const onMove = (x, y) => {
    tx = (x / window.innerWidth - 0.5) * 28;
    ty = (y / window.innerHeight - 0.5) * 28;
  };

  window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY), { passive: true });
  window.addEventListener(
    "touchmove",
    (e) => e.touches[0] && onMove(e.touches[0].clientX, e.touches[0].clientY),
    { passive: true }
  );
}

function initCardMotion() {
  const app = document.getElementById("app");
  if (!app || window.matchMedia("(hover: none)").matches) return;

  app.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".card, .schedule-block, .week-day, .topic-item");
    if (!card) return;
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    card.style.setProperty("--tilt-x", `${(-y * 4).toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${(x * 4).toFixed(2)}deg`);
    card.classList.add("is-tilting");
  });

  app.addEventListener("mouseleave", () => {
    app.querySelectorAll(".is-tilting").forEach((el) => {
      el.classList.remove("is-tilting");
      el.style.removeProperty("--tilt-x");
      el.style.removeProperty("--tilt-y");
    });
  }, true);
}

export function staggerTabContent() {
  const tab = document.querySelector(".tab.active");
  if (!tab || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const items = tab.querySelectorAll(
    ".card, .schedule-block, .week-day, .topic-item, .quiz-cat, .resource-item"
  );
  items.forEach((el, i) => {
    el.classList.remove("enter-pop");
    void el.offsetWidth;
    el.style.animationDelay = `${Math.min(i * 0.06, 0.45)}s`;
    el.classList.add("enter-pop");
  });
}
