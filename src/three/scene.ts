import * as THREE from 'three';
import { createSky } from './sky';
import { createOcean } from './ocean';
import { createVinyl } from './vinyl';
import { createTokens, type Token, type TokenAction } from './tokens';
import { createFireflies, createStars } from './particles';
import { createFireworks } from './fireworks';
import { nightPalette, palette, SUN_DIR } from './palette';

export interface SceneOptions {
  onVinylClick: () => void;
  onTokenClick: (action: TokenAction) => void;
  onHover: (label: string | null, x: number, y: number) => void;
}

export interface SceneApi {
  ready: Promise<void>;
  setPlaying(playing: boolean): void;
  /** 0 = senja, 1 = malam; finale = kembang api tahun baru */
  setNight(night: number, finale: boolean): void;
}

type CamKey = { pos: THREE.Vector3; target: THREE.Vector3 };
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Posisi kamera per section — kamera "terbang" mengikuti scroll. */
function cameraKeys(aspect: number): Record<string, CamKey> {
  const portrait = aspect < 0.9;
  return {
    hero: portrait ? { pos: v(0, 2.6, 15.5), target: v(0, -1.3, 0) } : { pos: v(0, 3, 11), target: v(-2.9, 2.5, 0) },
    about: portrait ? { pos: v(5, 4.5, 13), target: v(0, 3.6, 0) } : { pos: v(6.5, 4.6, 9.5), target: v(2.6, 2.4, 0) },
    squad: portrait ? { pos: v(-4, 4.5, 13), target: v(0, 3.4, 0) } : { pos: v(-6.5, 5, 10.5), target: v(0, 3, 0) },
    journey: portrait ? { pos: v(2, 2, 13), target: v(0, 3.4, -2) } : { pos: v(1.5, 2.3, 10), target: v(-3.2, 2.8, 0) },
    games: portrait ? { pos: v(-4, 3.5, 13), target: v(0, 4, 0) } : { pos: v(-5.5, 3.4, 9.5), target: v(0.4, 3.6, 0) },
    music: portrait ? { pos: v(0, 3.4, 12), target: v(0, 1.2, 0) } : { pos: v(-1.2, 3, 8.6), target: v(2.7, 2.8, 0) },
    excuse: portrait ? { pos: v(3, 1.4, 12), target: v(0, 3.4, -2) } : { pos: v(3, 1.3, 9.5), target: v(0, 2.8, -2) },
    discord: portrait ? { pos: v(0, 6, 14), target: v(0, 11, -30) } : { pos: v(0, 7, 13), target: v(0, 11, -30) },
  };
}

const smooth = (t: number) => t * t * (3 - 2 * t);

export function createScene(canvas: HTMLCanvasElement, opts: SceneOptions): SceneApi {
  const isMobile = matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: window.devicePixelRatio < 2,
      powerPreference: 'high-performance',
    });
  } catch {
    document.documentElement.classList.add('no-webgl');
    return { ready: Promise.resolve(), setPlaying() {}, setNight() {} };
  }

  const maxDpr = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 1.75);
  let dpr = maxDpr;
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(isMobile ? 55 : 45, window.innerWidth / window.innerHeight, 0.1, 1200);

  // --- lampu ---
  const hemi = new THREE.HemisphereLight('#7c78c8', '#0d3a3f', 1.4);
  scene.add(hemi);
  const sunLight = new THREE.DirectionalLight(palette.sun, 2.6);
  sunLight.position.copy(SUN_DIR).multiplyScalar(50);
  scene.add(sunLight);
  const fill = new THREE.DirectionalLight('#9fc6ff', 1.1);
  fill.position.set(4, 6, 10);
  scene.add(fill);
  const beatLight = new THREE.PointLight('#ffc061', 0, 14, 1.6);
  beatLight.position.set(0, 3, 1.5);
  scene.add(beatLight);

  // --- objek ---
  const sky = createSky();
  const stars = createStars(isMobile ? 700 : 1400);
  const ocean = createOcean(isMobile ? 160 : 256);
  const fireflies = createFireflies(isMobile ? 120 : 240);
  const tokens = createTokens();
  // desktop: langit kanan atas (kiri tertutup kartu, tengah tertutup piringan); HP: tengah, karena bidang pandang sempit
  const fireworks = isMobile ? createFireworks(5, 110, -8, 16) : createFireworks(8, 170, 4, 26);
  scene.add(sky.mesh, stars.points, ocean.mesh, fireflies.points, tokens.group, fireworks.points);
  stars.setPixelRatio(dpr);
  fireflies.setPixelRatio(dpr);
  fireworks.setPixelRatio(dpr);

  // warna senja asli; palette & SUN_DIR dipakai langsung oleh shader, jadi diubah di tempat
  const dusk = Object.fromEntries(Object.keys(nightPalette).map((k) => [k, palette[k as keyof typeof nightPalette].clone()]));
  const duskSunY = SUN_DIR.y;
  let nightTarget = 0;
  let night = 0;
  let finaleTarget = 0;
  let finale = 0;

  let vinyl: ReturnType<typeof createVinyl> | null = null;
  const ready = new Promise<void>((resolve) => {
    new THREE.TextureLoader().load(
      '/logo.webp',
      (tex) => {
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        vinyl = createVinyl(tex);
        scene.add(vinyl.object);
        resolve();
      },
      undefined,
      () => resolve(),
    );
  });

  // --- kamera mengikuti scroll ---
  let keys = cameraKeys(window.innerWidth / window.innerHeight);
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-cam]'));
  let mids: number[] = [];
  const measure = () => {
    const maxCenter = document.documentElement.scrollHeight - window.innerHeight / 2;
    mids = sections.map((s) => {
      const r = s.getBoundingClientRect();
      return Math.min(r.top + window.scrollY + r.height / 2, maxCenter);
    });
    if (mids.length) mids[0] = Math.min(mids[0], window.innerHeight / 2);
  };
  measure();
  new ResizeObserver(measure).observe(document.body);

  const desiredPos = new THREE.Vector3();
  const desiredTarget = new THREE.Vector3();
  const sectionFloat = () => {
    const c = window.scrollY + window.innerHeight / 2;
    if (!mids.length || c <= mids[0]) return 0;
    for (let i = 0; i < mids.length - 1; i++) {
      if (c < mids[i + 1]) return i + (c - mids[i]) / Math.max(1, mids[i + 1] - mids[i]);
    }
    return mids.length - 1;
  };
  const computeDesired = () => {
    const f = sectionFloat();
    const i = Math.min(Math.floor(f), sections.length - 1);
    const t = smooth(Math.min(1, f - i));
    const a = keys[sections[i]?.dataset.cam ?? 'hero'] ?? keys.hero;
    const b = keys[sections[Math.min(i + 1, sections.length - 1)]?.dataset.cam ?? 'hero'] ?? keys.hero;
    desiredPos.lerpVectors(a.pos, b.pos, t);
    desiredTarget.lerpVectors(a.target, b.target, t);
  };
  computeDesired();
  const camTarget = desiredTarget.clone();
  camera.position.copy(desiredPos);
  camera.lookAt(camTarget);

  // --- pointer & raycast ---
  const pointer = new THREE.Vector2(9, 9);
  const parallax = new THREE.Vector2();
  const parallaxSmooth = new THREE.Vector2();
  let pointerDirty = false;
  let pointerBlocked = true;
  let clientX = 0;
  let clientY = 0;
  const raycaster = new THREE.Raycaster();
  type Hover = { kind: 'vinyl' } | { kind: 'token'; token: Token } | null;
  let hovered: Hover = null;

  const isBackground = (el: Element | null) =>
    !!el && (el === document.documentElement || el === document.body || el.matches('main, section, canvas, [data-pass]'));

  window.addEventListener(
    'pointermove',
    (e) => {
      clientX = e.clientX;
      clientY = e.clientY;
      pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      parallax.copy(pointer);
      pointerBlocked = e.pointerType === 'touch' || !isBackground(e.target as Element);
      pointerDirty = true;
    },
    { passive: true },
  );
  // pointerleave tidak pernah terpicu di `document`, jadi dipasang di <html>
  document.documentElement.addEventListener('pointerleave', () => {
    pointerBlocked = true;
    pointerDirty = true;
  });
  window.addEventListener('click', (e) => {
    if (!isBackground(e.target as Element) || !hovered) return;
    if (hovered.kind === 'vinyl') opts.onVinylClick();
    else opts.onTokenClick(hovered.token.action);
  });

  const tokenRoots = tokens.tokens.map((t) => t.object);
  const updateHover = () => {
    let next: Hover = null;
    if (!pointerBlocked) {
      raycaster.setFromCamera(pointer, camera);
      const targets: THREE.Object3D[] = [...tokenRoots, ...(vinyl?.hitTargets ?? [])];
      const hit = raycaster.intersectObjects(targets, true)[0];
      if (hit) {
        let o: THREE.Object3D | null = hit.object;
        while (o && o.userData.tokenLabel === undefined) o = o.parent;
        const tok = o ? tokens.tokens.find((t) => t.object === o) : undefined;
        next = tok ? { kind: 'token', token: tok } : { kind: 'vinyl' };
      }
    }
    hovered = next;
    document.body.classList.toggle('pointer-3d', !!hovered);
    if (!hovered) opts.onHover(null, 0, 0);
    else
      opts.onHover(
        hovered.kind === 'vinyl' ? (playingTarget ? '❚❚ JEDA MUSIK' : '▶ PUTAR WAVE TO EARTH') : hovered.token.label,
        clientX,
        clientY,
      );
  };

  // --- resize ---
  const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    keys = cameraKeys(w / h);
    measure();
  };
  window.addEventListener('resize', onResize);

  // --- loop ---
  let playingTarget = 0;
  let playing = 0;
  let beatPhase = 0;
  let last = performance.now();
  let frameAcc = 0;
  let frameCount = 0;
  let time = 0;

  const tick = (now: number) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    time += dt * (reduceMotion ? 0.4 : 1);

    // "detak" lembut ~76 BPM saat musik diputar (simulasi — Spotify embed tidak membuka data audio)
    playing += (playingTarget - playing) * (1 - Math.exp(-dt * 2));
    beatPhase += dt * (76 / 60) * Math.PI * 2;
    const beat = Math.pow(0.5 + 0.5 * Math.cos(beatPhase), 6) * playing * (reduceMotion ? 0.3 : 1);

    computeDesired();
    parallaxSmooth.lerp(reduceMotion || isMobile ? parallax.set(0, 0) : parallax, 1 - Math.exp(-dt * 3));
    desiredPos.x += parallaxSmooth.x * 0.6;
    desiredPos.y += parallaxSmooth.y * 0.35;
    const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 2.6);
    camera.position.lerp(desiredPos, k);
    camTarget.lerp(desiredTarget, k);
    camera.lookAt(camTarget);

    sky.update(time, camera);
    stars.update(time, camera);
    ocean.update(time, beat);
    fireflies.update(time, beat);
    tokens.update(time, dt, playing, hovered?.kind === 'token' ? hovered.token : null, reduceMotion);
    vinyl?.update(time, dt, playing, beat, hovered?.kind === 'vinyl');
    beatLight.intensity = beat * 6 + playing * 1.5;

    // senja → malam sepanjang timeline perjalanan
    const prevNight = night;
    night += (nightTarget - night) * (1 - Math.exp(-dt * 2));
    if (Math.abs(night - prevNight) > 1e-4) {
      for (const k of Object.keys(nightPalette) as (keyof typeof nightPalette)[]) {
        palette[k].lerpColors(dusk[k], nightPalette[k], night);
      }
      SUN_DIR.set(0, duskSunY - 0.16 * night, -1).normalize();
      sunLight.position.copy(SUN_DIR).multiplyScalar(50);
      sunLight.intensity = 2.6 - 2 * night;
      hemi.intensity = 1.4 - 0.7 * night;
    }
    finale += (finaleTarget - finale) * (1 - Math.exp(-dt * 1.5));
    fireworks.update(time, finale);

    if (pointerDirty || hovered) {
      pointerDirty = false;
      updateHover();
    }

    renderer.render(scene, camera);

    // turunkan resolusi otomatis kalau FPS drop (laptop kentang tetap lancar)
    frameAcc += dt;
    frameCount++;
    if (frameCount === 90) {
      const avg = frameAcc / frameCount;
      if (avg > 1 / 45 && dpr > 0.75) {
        dpr = Math.max(0.75, dpr - 0.25);
        renderer.setPixelRatio(dpr);
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        stars.setPixelRatio(dpr);
        fireflies.setPixelRatio(dpr);
        fireworks.setPixelRatio(dpr);
      }
      frameAcc = 0;
      frameCount = 0;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  return {
    ready,
    setPlaying(p: boolean) {
      playingTarget = p ? 1 : 0;
      if (hovered?.kind === 'vinyl') pointerDirty = true;
    },
    setNight(n: number, fin: boolean) {
      nightTarget = n;
      finaleTarget = fin && !reduceMotion ? 1 : 0;
    },
  };
}
