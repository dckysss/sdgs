import { featuredGames, otherGames, type FeaturedGame } from '../data/games';
import { escapeHtml, reduceMotion } from './util';

function starPath(cx: number, cy: number, R: number, r: number) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r : R;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rad).toFixed(1)} ${(cy + Math.sin(a) * rad).toFixed(1)}`;
  }
  return d + 'Z';
}

const glyphs: Record<FeaturedGame['glyph'], string> = {
  crosshair: `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" stroke-width="6"/><path d="M60 8v26M60 86v26M8 60h26M86 60h26" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><circle cx="60" cy="60" r="6" fill="currentColor"/></svg>`,
  wanted: `<svg viewBox="0 0 200 40">${[20, 60, 100, 140, 180]
    .map((x, i) => `<path d="${starPath(x, 21, 18, 7.5)}" fill="currentColor" opacity="${i < 3 ? 1 : 0.35}"/>`)
    .join('')}</svg>`,
  lanes: `<svg viewBox="0 0 120 120"><path d="M26 94V26h68M26 94h68V26M26 94 94 26" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="26" cy="94" r="11" fill="currentColor"/><circle cx="94" cy="26" r="11" fill="currentColor"/></svg>`,
  blocks: `<svg viewBox="0 0 120 120"><g transform="rotate(-12 60 60)"><rect x="20" y="24" width="50" height="50" rx="6" fill="currentColor"/><rect x="58" y="60" width="40" height="40" rx="6" fill="currentColor" opacity=".55"/><rect x="72" y="16" width="28" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="5"/></g></svg>`,
};

export function renderGames() {
  const grid = document.getElementById('games-grid');
  if (grid) {
    grid.innerHTML = featuredGames
      .map(
        (g, i) => `
      <article class="game-card reveal" style="--c1:${g.colors[0]};--c2:${g.colors[1]};--accent:${g.accent};--d:${i * 90}ms">
        <span class="game-card__no">0${i + 1}</span>
        <div class="game-card__glyph game-card__glyph--${g.glyph}" aria-hidden="true">${glyphs[g.glyph]}</div>
        <div class="game-card__body">
          <p class="game-card__genre">${escapeHtml(g.genre)}</p>
          <h3>${escapeHtml(g.name)}</h3>
          <p class="game-card__line">${escapeHtml(g.tagline)}</p>
          <ul class="game-card__tags">${g.tags.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
        </div>
        <span class="game-card__bgname" aria-hidden="true">${escapeHtml(g.short)}</span>
        <span class="game-card__shine" aria-hidden="true"></span>
      </article>`,
      )
      .join('');

    if (!reduceMotion() && matchMedia('(hover: hover)').matches) {
      grid.querySelectorAll<HTMLElement>('.game-card').forEach((card) => {
        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width;
          const y = (e.clientY - r.top) / r.height;
          card.style.setProperty('--rx', `${(0.5 - y) * 12}deg`);
          card.style.setProperty('--ry', `${(x - 0.5) * 14}deg`);
          card.style.setProperty('--mx', `${x * 100}%`);
          card.style.setProperty('--my', `${y * 100}%`);
          card.classList.add('is-tilting');
        });
        card.addEventListener('pointerleave', () => {
          card.style.setProperty('--rx', '0deg');
          card.style.setProperty('--ry', '0deg');
          card.classList.remove('is-tilting');
        });
      });
    }
  }

  const others = document.getElementById('other-games');
  if (others) {
    others.innerHTML = otherGames.length
      ? otherGames.map((n) => `<li>${escapeHtml(n)}</li>`).join('')
      : `<li class="chip--empty">Daftarnya lagi ditulis — segera nyusul ✍️</li>`;
  }
}
