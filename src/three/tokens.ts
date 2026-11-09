import * as THREE from 'three';

export type TokenAction = 'games' | 'discord' | 'music' | 'chill';

export interface Token {
  object: THREE.Group;
  label: string;
  action: TokenAction;
}

const mat = (color: THREE.ColorRepresentation, emissive = 0.12) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: 0.5,
    metalness: 0.08,
    flatShading: true,
    emissive: color,
    emissiveIntensity: emissive,
  });

/** Kristal tajam merah — buat Valorant. */
function crystal() {
  const g = new THREE.Group();
  const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), mat('#ff4655', 0.25));
  shard.scale.set(0.7, 1.5, 0.7);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.035, 8, 48), mat('#f7efd8', 0.5));
  ring.rotation.x = Math.PI / 2.4;
  g.add(shard, ring);
  return g;
}

/** Mobil low-poly — buat GTA V. */
function car() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.34, 0.74), mat('#f5b82e', 0.18));
  body.position.y = 0.27;
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.3, 0.64), mat('#1d2f3a', 0.1));
  cabin.position.set(-0.1, 0.58, 0);
  const wheelGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.14, 14);
  wheelGeo.rotateX(Math.PI / 2);
  const wheelMat = mat('#121212', 0);
  for (const [x, z] of [
    [0.48, 0.38],
    [-0.48, 0.38],
    [0.48, -0.38],
    [-0.48, -0.38],
  ]) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(x, 0.12, z);
    g.add(w);
  }
  const lightGeo = new THREE.BoxGeometry(0.04, 0.08, 0.16);
  const head = new THREE.MeshBasicMaterial({ color: '#fff6d8' });
  const tail = new THREE.MeshBasicMaterial({ color: '#ff3b3b' });
  for (const z of [0.24, -0.24]) {
    const h = new THREE.Mesh(lightGeo, head);
    h.position.set(0.76, 0.3, z);
    const t = new THREE.Mesh(lightGeo, tail);
    t.position.set(-0.76, 0.3, z);
    g.add(h, t);
  }
  g.add(body, cabin);
  g.scale.setScalar(0.9);
  return g;
}

/** Stik game — simbol mabar. */
function gamepad() {
  const g = new THREE.Group();
  const bodyMat = mat('#efe6cf', 0.15);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.22, 0.6), bodyMat);
  const gripGeo = new THREE.SphereGeometry(0.3, 12, 10);
  for (const x of [-0.5, 0.5]) {
    const grip = new THREE.Mesh(gripGeo, bodyMat);
    grip.scale.set(1, 0.55, 1.25);
    grip.position.set(x, -0.02, 0.2);
    g.add(grip);
  }
  const dark = mat('#26343c', 0.05);
  const dpadA = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.06, 0.08), dark);
  const dpadB = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.26), dark);
  dpadA.position.set(-0.36, 0.13, 0);
  dpadB.position.set(-0.36, 0.13, 0);
  const btnGeo = new THREE.SphereGeometry(0.055, 10, 8);
  const btnColors = ['#3fae5f', '#e8522c', '#3d8bff', '#f5b82e'];
  const btnPos = [
    [0.36, -0.1],
    [0.46, 0],
    [0.26, 0],
    [0.36, 0.1],
  ];
  btnPos.forEach(([x, z], i) => {
    const b = new THREE.Mesh(btnGeo, mat(btnColors[i], 0.4));
    b.position.set(x, 0.13, z);
    g.add(b);
  });
  g.add(body, dpadA, dpadB);
  return g;
}

/** Gelas minuman dari logo — "santai dulu". */
function cup() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.26, 0.8, 20), mat('#e8522c', 0.2));
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.335, 0.31, 0.14, 20), mat('#f7efd8', 0.2));
  band.position.y = 0.05;
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.06, 20), mat('#f7efd8', 0.25));
  lid.position.y = 0.42;
  const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.8, 8), mat('#ffffff', 0.4));
  straw.position.set(0.1, 0.72, 0);
  straw.rotation.z = -0.3;
  g.add(body, band, lid, straw);
  return g;
}

/** Not balok ♪ */
function note() {
  const g = new THREE.Group();
  const m = mat('#f7efd8', 0.6);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 10), m);
  head.scale.set(1.3, 1, 0.8);
  head.rotation.z = 0.4;
  const stem = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.04), m);
  stem.position.set(0.16, 0.3, 0);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.04), m);
  flag.position.set(0.25, 0.54, 0);
  flag.rotation.z = -0.6;
  g.add(head, stem, flag);
  return g;
}

/** Minion — ikon server Discord Join ae. */
function minion() {
  const g = new THREE.Group();
  const yellow = mat('#f7d23e', 0.2);
  const denim = mat('#2f5fa8', 0.15);
  const dark = mat('#2a2a2a', 0.05);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.6, 8, 20), yellow);
  const overall = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.42, 20), denim);
  overall.position.y = -0.28;
  const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.43, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), denim);
  bottom.position.y = -0.49;
  const bib = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.06), denim);
  bib.position.set(0, -0.02, 0.4);

  // kacamata: tali + bingkai perak + mata
  const strap = new THREE.Mesh(new THREE.CylinderGeometry(0.435, 0.435, 0.1, 20), dark);
  strap.position.y = 0.22;
  const goggle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 20), mat('#b9bcc2', 0.2));
  goggle.rotation.x = Math.PI / 2;
  goggle.position.set(0, 0.22, 0.4);
  const eye = new THREE.Mesh(new THREE.CircleGeometry(0.15, 20), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  eye.position.set(0, 0.22, 0.475);
  const iris = new THREE.Mesh(new THREE.CircleGeometry(0.065, 16), new THREE.MeshBasicMaterial({ color: '#6b4a2b' }));
  iris.position.set(0, 0.22, 0.48);
  const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.03, 12), new THREE.MeshBasicMaterial({ color: '#111111' }));
  pupil.position.set(0, 0.22, 0.485);

  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 6, 16, Math.PI), dark);
  mouth.rotation.z = Math.PI;
  mouth.position.set(0, -0.02, 0.43);

  const armGeo = new THREE.CapsuleGeometry(0.06, 0.32, 4, 8);
  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(armGeo, yellow);
    arm.position.set(s * 0.47, -0.12, 0);
    arm.rotation.z = s * 0.45;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.18, 10), denim);
    leg.position.set(s * 0.15, -0.95, 0);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), dark);
    shoe.position.set(s * 0.15, -1.06, 0.04);
    g.add(arm, leg, shoe);
  }

  g.add(body, overall, bottom, bib, strap, goggle, eye, iris, pupil, mouth);
  g.scale.setScalar(0.8);
  return g;
}

interface Orbit {
  radius: number;
  height: number;
  speed: number;
  phase: number;
  spin: THREE.Vector3;
}

const defs: Array<{ build: () => THREE.Group; label: string; action: TokenAction; orbit: Orbit }> = [
  { build: crystal, label: 'VALORANT', action: 'games', orbit: { radius: 4.6, height: 4.6, speed: 0.12, phase: 0.4, spin: new THREE.Vector3(0.2, 0.6, 0) } },
  { build: car, label: 'GTA V', action: 'games', orbit: { radius: 5.3, height: 1.7, speed: 0.1, phase: 2.4, spin: new THREE.Vector3(0, 0.5, 0.08) } },
  { build: gamepad, label: 'MABAR DI JOIN AE', action: 'discord', orbit: { radius: 5.9, height: 3.4, speed: 0.09, phase: 1.3, spin: new THREE.Vector3(0.3, 0.4, 0.15) } },
  { build: cup, label: 'SANTAI DULU', action: 'chill', orbit: { radius: 3.9, height: 1.3, speed: 0.11, phase: 5.4, spin: new THREE.Vector3(0.1, 0.7, 0.05) } },
  { build: note, label: '♪ WAVE TO EARTH', action: 'music', orbit: { radius: 3.4, height: 5.6, speed: 0.16, phase: 3.2, spin: new THREE.Vector3(0, 0.8, 0.1) } },
  { build: note, label: '♪ WAVE TO EARTH', action: 'music', orbit: { radius: 6.4, height: 5.0, speed: 0.07, phase: 0.1, spin: new THREE.Vector3(0, -0.6, 0.1) } },
  { build: minion, label: 'MINION JOIN AE', action: 'discord', orbit: { radius: 5.6, height: 3.9, speed: 0.08, phase: 0.9, spin: new THREE.Vector3(0, 0.35, 0) } },
];

/** Benda-benda bertema game yang mengorbit piringan hitam. */
export function createTokens() {
  const group = new THREE.Group();
  const tokens: Array<Token & { orbit: Orbit; hover: number; base: number }> = defs.map((d) => {
    const object = d.build();
    object.userData.tokenLabel = d.label;
    // benda yang tidak berguling (spin.x = 0, mis. minion) mulai dalam posisi tegak
    object.rotation.set(d.orbit.spin.x ? Math.random() * 6 : 0, Math.random() * 6, 0);
    group.add(object);
    return { object, label: d.label, action: d.action, orbit: d.orbit, hover: 0, base: object.scale.x };
  });

  return {
    group,
    tokens: tokens as Token[],
    update(time: number, dt: number, playing: number, hovered: Token | null, reduceMotion: boolean) {
      const speedMul = (reduceMotion ? 0.3 : 1) * (1 + playing * 0.6);
      for (const t of tokens) {
        const o = t.orbit;
        const ang = o.phase + time * o.speed * speedMul;
        t.object.position.set(
          Math.cos(ang) * o.radius,
          o.height + Math.sin(time * 0.7 + o.phase) * 0.25,
          Math.sin(ang) * o.radius * 0.75,
        );
        t.object.rotation.x += o.spin.x * dt * speedMul;
        t.object.rotation.y += o.spin.y * dt * speedMul;
        t.object.rotation.z += o.spin.z * dt * speedMul;
        t.hover += ((hovered === t ? 1 : 0) - t.hover) * (1 - Math.exp(-dt * 10));
        t.object.scale.setScalar(t.base * (1 + t.hover * 0.3));
      }
    },
  };
}
