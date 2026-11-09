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

/** Timeline perjalanan: garis menyala mengikuti scroll, kartu di tengah layar aktif, tahun besar di latar. */
export function initTimeline() {
  const tl = document.querySelector<HTMLElement>('.timeline');
  if (!tl) return;
  const items = tl.querySelectorAll<HTMLElement>('.tl');
  items.forEach((li) => {
    const year = li.querySelector('.tl__when')?.textContent?.match(/\d{4}/);
    if (year) li.dataset.year = year[0];
  });

  let raf = 0;
  const update = () => {
    raf = 0;
    const r = tl.getBoundingClientRect();
    const p = (window.innerHeight * 0.6 - r.top) / r.height;
    tl.style.setProperty('--p', String(Math.min(1, Math.max(0, p))));
  };
  window.addEventListener('scroll', () => (raf ||= requestAnimationFrame(update)), { passive: true });
  update();

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle('is-active', e.isIntersecting)),
    { rootMargin: '-42% 0px -42% 0px' },
  );
  items.forEach((li) => io.observe(li));
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
