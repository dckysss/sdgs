import { config } from '../config';
import { categories } from '../data/discord';
import { escapeHtml, scrollToId, toast } from './util';

const icons = {
  text: `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.5 3 9.7 8H5.5l-.3 2h4.2l-.8 4H4.4l-.3 2h4.2l-.8 5h2l.8-5h4l-.8 5h2l.8-5h4.2l.3-2h-4.2l.8-4h4.2l.3-2h-4.2l.8-5h-2l-.8 5h-4l.8-5h-2Zm.6 7h4l-.8 4h-4l.8-4Z"/></svg>`,
  voice: `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a1 1 0 0 0-1.7-.7L6 6.6H3a1 1 0 0 0-1 1v8.8a1 1 0 0 0 1 1h3l4.3 4.3A1 1 0 0 0 12 21V3Zm4.2 4.2a1 1 0 0 1 1.4 0 6.8 6.8 0 0 1 0 9.6 1 1 0 1 1-1.4-1.4 4.8 4.8 0 0 0 0-6.8 1 1 0 0 1 0-1.4Z"/></svg>`,
  stats: `<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M10.5 3 9.7 8H5.5l-.3 2h4.2l-.8 4H4.4l-.3 2h4.2l-.8 5h2l.8-5h4l-.8 5h2l.8-5h4.2l.3-2h-4.2l.8-4h4.2l.3-2h-4.2l.8-5h-2l-.8 5h-4l.8-5h-2Zm.6 7h4l-.8 4h-4l.8-4Z"/></svg>`,
};

const chevron = `<svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5.3 9.3a1 1 0 0 1 1.4 0L12 14.6l5.3-5.3a1 1 0 1 1 1.4 1.4l-6 6a1 1 0 0 1-1.4 0l-6-6a1 1 0 0 1 0-1.4Z"/></svg>`;

export function initDiscord() {
  const { inviteUrl, guildId, memberCount } = config.discord;
  let invite: string = inviteUrl;

  document.querySelectorAll<HTMLElement>('[data-members]').forEach((el) => (el.textContent = String(memberCount)));

  const body = document.getElementById('dc-channels');
  if (body) {
    body.innerHTML = categories
      .map(
        (cat) => `
        <div class="dc__cat${cat.collapsed ? ' is-collapsed' : ''}">${chevron}<span>${escapeHtml(cat.name)}</span></div>
        ${cat.channels
          .map((ch) => {
            const name = ch.type === 'stats' ? `${ch.name}-${memberCount}` : ch.name;
            return `<div class="dc__ch${ch.active ? ' is-active' : ''}">${icons[ch.type]}<span>${escapeHtml(name)}</span></div>`;
          })
          .join('')}`,
      )
      .join('');
  }

  const applyInvite = () => {
    const note = document.querySelector<HTMLElement>('[data-invite-note]');
    document.querySelectorAll<HTMLAnchorElement>('[data-discord-link]').forEach((a) => {
      if (invite) {
        a.href = invite;
        a.target = '_blank';
        a.rel = 'noopener';
      }
    });
    if (note) note.textContent = invite ? '' : 'Link invite belum dipasang — minta langsung ke member SDGS ya.';
  };
  applyInvite();

  // tombol di section Discord tanpa invite → kasih tahu, jangan diam saja
  document.querySelector('#discord [data-discord-link]')?.addEventListener('click', (e) => {
    if (invite) return;
    e.preventDefault();
    toast('Link invite belum dipasang. Minta ke member SDGS dulu ya 🙏');
  });
  document.querySelectorAll<HTMLAnchorElement>('.hero [data-discord-link]').forEach((a) =>
    a.addEventListener('click', (e) => {
      if (invite) return;
      e.preventDefault();
      scrollToId('discord');
    }),
  );

  // Jumlah online live via Discord Server Widget (opsional)
  const online = document.querySelector<HTMLElement>('[data-online]');
  if (guildId && online) {
    fetch(`https://discord.com/api/guilds/${encodeURIComponent(guildId)}/widget.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: { presence_count?: number; instant_invite?: string | null }) => {
        if (typeof data.presence_count === 'number') {
          online.textContent = `${data.presence_count} online · `;
          document.querySelector('.dc')?.classList.add('has-online');
        }
        if (!invite && data.instant_invite) {
          invite = data.instant_invite;
          applyInvite();
        }
      })
      .catch(() => {
        /* widget belum diaktifkan — biarkan tampilan statis */
      });
  }
}
