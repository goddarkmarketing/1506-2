(() => {
  const root = document.querySelector("[data-dg-reviews]");
  if (!root) return;

  const track = root.querySelector("[data-dg-rev-track]");
  const slides = Array.from(root.querySelectorAll(".dg-rev__slide"));
  if (!track || slides.length === 0) return;

  const section = root.closest("section") || document;
  const prevBtn = section.querySelector("[data-dg-rev-prev]");
  const nextBtn = section.querySelector("[data-dg-rev-next]");

  let index = 0;
  let timer = null;
  const GAP = 16; // gap-4

  function perView() {
    const w = window.innerWidth;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
  }

  function maxIndex() {
    return Math.max(0, slides.length - perView());
  }

  function go(to, { soft } = {}) {
    const max = maxIndex();
    if (to > max) index = 0;
    else if (to < 0) index = max;
    else index = to;

    const slideW = slides[0].getBoundingClientRect().width;
    const x = index * (slideW + GAP);
    if (soft === false) track.style.transition = "none";
    track.style.transform = `translateX(-${x}px)`;
    if (soft === false) {
      requestAnimationFrame(() => {
        track.style.transition = "transform .45s ease";
      });
    }
  }

  function next() {
    go(index + 1);
  }
  function prev() {
    go(index - 1);
  }

  function start() {
    stop();
    timer = setInterval(next, 4500);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  prevBtn?.addEventListener("click", () => {
    prev();
    start();
  });
  nextBtn?.addEventListener("click", () => {
    next();
    start();
  });

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener(
    "touchstart",
    () => stop(),
    { passive: true }
  );
  root.addEventListener("touchend", () => start(), { passive: true });

  window.addEventListener("resize", () => {
    go(Math.min(index, maxIndex()), { soft: false });
  });

  go(0, { soft: false });
  start();
})();
