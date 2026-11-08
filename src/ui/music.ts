import { config } from '../config';
import { scrollToId, toast } from './util';

/** Bagian YouTube IFrame API yang dipakai (https://developers.google.com/youtube/iframe_api_reference) */
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  loadPlaylist(ids: string[]): void;
  setVolume(volume: number): void;
  getPlayerState(): number;
  /** shortcut: getVideoData tidak ada di dokumentasi resmi YouTube, tapi stabil dipakai; kalau hilang, teks kembali ke "wave to earth" */
  getVideoData?(): { title?: string };
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
    const { openers, tracks } = config.music;
    const first = openers[Math.floor(Math.random() * openers.length)];

    window.onYouTubeIframeAPIReady = () => {
      const YT = window.YT!;
      new YT.Player(el, {
        width: '100%',
        height: '100%',
        playerVars: { playsinline: 1, rel: 0 },
        events: {
          onReady: (e: YTEvent) => {
            e.target.setVolume(slider?.valueAsNumber ?? 50);
            // loadPlaylist langsung memutar (autoplay); `videoId` + `playlist` tidak dipakai karena YouTube mengabaikan videoId-nya
            e.target.loadPlaylist([first, ...tracks.filter((id) => id !== first)]);
            resolve(e.target);
          },
          onStateChange: (e: YTEvent) => {
            if (e.data === PLAYING) {
              setPlaying(true);
              // judul track Topic sudah polos ("daisy."); judul dari channel resmi diawali "wave to earth - "
              const title = e.target.getVideoData?.().title?.replace(/^wave to earth\s*-\s*/i, '') || 'wave to earth';
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
      document.querySelectorAll<HTMLElement>('[data-yt-video]').forEach((v) =>
        videos.push(
          new YT.Player(v, {
            width: '100%',
            height: '100%',
            videoId: v.dataset.ytVideo,
            playerVars: { playsinline: 1, rel: 0 },
            events: {
              onStateChange: (e: YTEvent) => {
                if (e.data === PLAYING) playerP.then((p) => p.pauseVideo(), () => {});
              },
            },
          }),
        ),
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
