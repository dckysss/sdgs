import { config } from '../config';
import { scrollToId, toast } from './util';

/** Bagian YouTube IFrame API yang dipakai (https://developers.google.com/youtube/iframe_api_reference) */
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  cuePlaylist(ids: string[], index?: number): void;
  playVideoAt(index: number): void;
  getPlaylistIndex(): number;
  setVolume(volume: number): void;
  getPlayerState(): number;
}
type YTEvent = { target: YTPlayer; data: number };
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: object) => YTPlayer };
    onYouTubeIframeAPIReady?: () => void;
  }
}
const PLAYING = 1;
const ENDED = 0;
const PAUSED = 2;

export function initMusic(opts: { onChange: (playing: boolean) => void }) {
  const slider = document.querySelector<HTMLInputElement>('[data-volume]');
  const videos: YTPlayer[] = [];
  let playing = false;
  const { openers } = config.music;
  const allTracks: readonly { id: string; title: string; karbit?: boolean }[] = config.music.tracks;
  // Lagu karbit cuma tampil dicoret, tidak masuk playlist → index playlist = index di `tracks`
  const tracks = allTracks.filter((t) => !t.karbit);

  // Daftar lagu: klik = langsung putar lagu itu, playlist lanjut dari situ
  const list = document.querySelector<HTMLOListElement>('[data-tracks]');
  const items = allTracks.map((t, n) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'track';
    const no = document.createElement('span');
    no.className = 'track__no';
    no.textContent = String(n + 1).padStart(2, '0');
    const title = document.createElement('span');
    title.className = 'track__title';
    title.textContent = t.title;
    b.append(no, title);
    if (t.karbit) {
      const note = document.createElement('span');
      note.className = 'track__note';
      note.textContent = 'karbit lu?';
      b.append(note);
      b.disabled = true;
    } else {
      const i = tracks.indexOf(t);
      b.addEventListener('click', () =>
        playerP.then(
          (p) => p.playVideoAt(i),
          () => toast('Player YouTube gagal dimuat. Coba buka langsung di YouTube ya.'),
        ),
      );
    }
    li.appendChild(b);
    list?.appendChild(li);
    return b;
  });
  // Video SDGS Core tampil sebagai layer di atas semua UI (top layer <dialog>), latar digelapkan lewat ::backdrop
  const modal = document.querySelector<HTMLDialogElement>('[data-video-modal]');
  document.querySelectorAll('[data-video-open]').forEach((b) =>
    b.addEventListener('click', () => {
      modal?.showModal();
      videos.forEach((v) => v.playVideo());
    }),
  );
  modal?.addEventListener('close', () => videos.forEach((v) => v.pauseVideo()));
  modal?.addEventListener('click', (e) => e.target === modal && modal.close()); // klik area gelap = tutup

  const markCurrent = (i: number) => {
    const current = tracks[i];
    items.forEach((b, n) => b.toggleAttribute('aria-current', allTracks[n] === current));
  };

  const setPlaying = (p: boolean) => {
    if (p === playing) return;
    playing = p;
    document.body.classList.toggle('is-playing', p);
    document.querySelectorAll('[data-now]').forEach((el) => (el.textContent = p ? 'Lagi muter: wave to earth' : 'Dijeda'));
    document.querySelectorAll('[data-play-label]').forEach((el) => {
      const isSmall = el.closest('.btn--small');
      el.textContent = p ? 'Jeda' : isSmall ? 'Putar' : 'Putar wave to earth';
    });
    opts.onChange(p);
  };

  const playerP = new Promise<YTPlayer>((resolve, reject) => {
    const el = document.getElementById('yt-player');
    if (!el) return reject(new Error('no player element'));
    const first = openers[Math.floor(Math.random() * openers.length)];
    const ids = tracks.map((t) => t.id);

    window.onYouTubeIframeAPIReady = () => {
      const YT = window.YT!;
      new YT.Player(el, {
        width: '100%',
        height: '100%',
        playerVars: { playsinline: 1, rel: 0 },
        events: {
          onReady: (e: YTEvent) => {
            e.target.setVolume(slider?.valueAsNumber ?? 50);
            // cue = siapkan tanpa memutar; musik baru jalan setelah user klik Login
            e.target.cuePlaylist(ids, Math.max(0, ids.indexOf(first)));
            resolve(e.target);
          },
          onStateChange: (e: YTEvent) => {
            if (e.data === PLAYING) {
              setPlaying(true);
              const i = e.target.getPlaylistIndex();
              markCurrent(i);
              const title = tracks[i]?.title ?? 'wave to earth';
              document.querySelectorAll<HTMLElement>('[data-now]').forEach((el) => {
                el.textContent = `Lagi muter: ${title}`;
                el.title = title;
              });
              videos.forEach((v) => v.pauseVideo()); // jangan tabrakan suara dengan video SDGS Core
            } else if (e.data === PAUSED || e.data === ENDED) setPlaying(false);
          },
        },
      });

      // Video lain di halaman (SDGS Core): saat diputar, musik dijeda.
      document.querySelectorAll<HTMLElement>('[data-yt-video]').forEach(
        (v) =>
          new YT.Player(v, {
            width: '100%',
            height: '100%',
            videoId: v.dataset.ytVideo,
            playerVars: { playsinline: 1, rel: 0 },
            events: {
              // didaftarkan saat siap, karena playVideo/pauseVideo belum ada sebelum onReady
              onReady: (e: YTEvent) => {
                videos.push(e.target);
                if (modal?.open) e.target.playVideo();
              },
              onStateChange: (e: YTEvent) => {
                if (e.data === PLAYING) playerP.then((p) => p.pauseVideo(), () => {});
              },
            },
          }),
      );
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = () => {
      el.innerHTML = `<div class="player__placeholder">Player YouTube gagal dimuat (cek koneksi / adblock).</div>`;
      reject(new Error('youtube script failed'));
    };
    document.head.appendChild(s);
  });
  playerP.catch(() => {});

  const play = () => playerP.then((p) => p.playVideo(), () => {});

  slider?.addEventListener('input', () => playerP.then((p) => p.setVolume(slider.valueAsNumber), () => {}));

  const toggle = async () => {
    try {
      const p = await playerP;
      if (p.getPlayerState() === PLAYING) return p.pauseVideo();
      p.playVideo();
      window.setTimeout(() => {
        if (!playing) {
          scrollToId('musik');
          toast('Klik ▶ di player YouTube ya — browser kadang minta klik langsung.');
        }
      }, 2500);
    } catch {
      toast('Player YouTube gagal dimuat. Coba buka langsung di YouTube ya.');
    }
  };

  document.querySelectorAll<HTMLButtonElement>('[data-play]').forEach((b) => b.addEventListener('click', toggle));

  return { toggle, play };
}
