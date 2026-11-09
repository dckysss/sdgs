export function initNav() {
  const nav = document.getElementById('nav');
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav__links a'));

  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    nav?.classList.toggle('scrolled', y > 24);
    // sembunyi saat scroll ke bawah, muncul lagi saat ke atas; ambang 4px biar tidak kedip karena scroll halus
    if (Math.abs(y - lastY) > 4) {
      nav?.classList.toggle('nav--hidden', y > lastY && y > 80);
      lastY = y;
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const id = (e.target as HTMLElement).id;
        links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  document.querySelectorAll('main section[id]').forEach((s) => io.observe(s));
}

export function initReveal() {
  const els = document.querySelectorAll<HTMLElement>('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
  );
  els.forEach((el) => io.observe(el));
}
