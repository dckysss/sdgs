export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

let toastTimer = 0;
export function toast(message: string, ms = 3200) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), ms);
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' });
}
