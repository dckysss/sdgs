import { excuses } from '../data/excuses';
import { toast } from './util';

export function initExcuses() {
  const card = document.getElementById('excuse-card');
  const text = document.getElementById('excuse-text');
  const no = document.getElementById('excuse-no');
  const btn = document.getElementById('excuse-btn');
  const copy = document.getElementById('excuse-copy');
  if (!card || !text || !no || !btn || !copy) return;

  let count = 0;
  let last = -1;
  let current = '';

  btn.addEventListener('click', () => {
    let i = Math.floor(Math.random() * excuses.length);
    if (i === last) i = (i + 1) % excuses.length;
    last = i;
    count++;
    current = excuses[i];
    card.classList.remove('flip');
    void card.offsetWidth; // restart animasi
    card.classList.add('flip');
    window.setTimeout(() => {
      text.textContent = `“${current}”`;
      no.textContent = `#${String(count).padStart(2, '0')}`;
    }, 180);
  });

  copy.addEventListener('click', async () => {
    if (!current) return toast('Gacha dulu alasannya 🎲');
    try {
      await navigator.clipboard.writeText(`${current} — santai dulu ga sih? 😌`);
      toast('Disalin. Tinggal paste ke chat tim.');
    } catch {
      toast('Gagal menyalin — salin manual aja ya.');
    }
  });
}
