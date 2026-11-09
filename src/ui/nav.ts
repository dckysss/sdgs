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

/**
 * Timeline perjalanan: garis menyala mengikuti scroll, kartu di tengah layar aktif.
 * `onScene(night, finale)`: langit 3D jadi malam sepanjang timeline, kembang api saat kartu upcoming aktif.
 */
export function initTimeline(onScene?: (night: number, finale: boolean) => void) {
  const tl = document.querySelector<HTMLElement>('.timeline');
  if (!tl) return;
  const items = tl.querySelectorAll<HTMLElement>('.tl');
  const finaleCard = tl.querySelector('.tl--upcoming');
  const clamp = (x: number) => Math.min(1, Math.max(0, x));

  let raf = 0;
  const update = () => {
    raf = 0;
    const r = tl.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = clamp((vh * 0.6 - r.top) / r.height);
    tl.style.setProperty('--p', String(p));
    // kembali senja setelah timeline lewat dari layar
    // finale: kartu upcoming di tengah, atau sudah lewat tapi langit di bawahnya masih terlihat (ruang kosong di HP)
    const finale = !!finaleCard?.classList.contains('is-active') || (p >= 1 && r.bottom > vh * 0.15);
    onScene?.(p * clamp(r.bottom / (vh * 0.3)), finale);
  };
  window.addEventListener('scroll', () => (raf ||= requestAnimationFrame(update)), { passive: true });
  update();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-active', e.isIntersecting));
      update();
    },
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
