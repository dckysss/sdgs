import './style.css';
import { createScene, type SceneApi } from './three/scene';
import { initMusic } from './ui/music';
import { renderGames } from './ui/games';
import { initExcuses } from './ui/excuses';
import { initDiscord } from './ui/discord';
import { initNav, initReveal } from './ui/nav';
import { scrollToId, toast } from './ui/util';

renderGames();
initDiscord();
initExcuses();
initNav();
initReveal();

let scene: SceneApi | null = null;
const music = initMusic({
  onChange: (p) => {
    scene?.setPlaying(p);
    if (p) enter(); // autoplay diizinkan browser → tidak perlu klik Login
  },
});

const tooltip = document.getElementById('tooltip')!;
const canvas = document.getElementById('scene') as HTMLCanvasElement;

scene = createScene(canvas, {
  onVinylClick: () => music.toggle(),
  onTokenClick: (action) => {
    if (action === 'games') scrollToId('game');
    else if (action === 'discord') scrollToId('discord');
    else if (action === 'music') music.toggle();
    else toast('Santai dulu ga sih? 🧋');
  },
  onHover: (label, x, y) => {
    if (!label) {
      tooltip.classList.remove('show');
      return;
    }
    tooltip.textContent = label;
    tooltip.style.transform = `translate(${x}px, ${y}px) translate(-50%, -170%)`;
    tooltip.classList.add('show');
  },
});

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const loader = document.getElementById('loader')!;
function enter() {
  loader.classList.add('done');
  document.documentElement.classList.add('loaded');
}
loader.querySelectorAll<HTMLButtonElement>('[data-enter]').forEach((b) =>
  b.addEventListener('click', () => {
    if (b.dataset.enter === 'music') music.play();
    enter();
  }),
);

// Tombol Login muncul begitu halaman siap (logo + font termuat, maks 3 detik) — tanpa jeda buatan.
Promise.race([Promise.all([scene.ready, document.fonts?.ready]), wait(3000)]).then(() => {
  if (loader.classList.contains('done')) return;
  loader.classList.add('gate');
  loader.removeAttribute('aria-hidden');
  loader.querySelector('button')?.focus();
});
