import * as THREE from 'three';
import { palette } from './palette';

const faceVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Alur piringan + kilau anisotropik yang diam di tempat walau piringannya berputar.
const faceFragment = /* glsl */ `
  uniform float uRot;
  uniform vec3 uTint;
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);
    float a = atan(p.y, p.x) + uRot;

    float g = sin(r * 520.0) * 0.5 + 0.5;
    float zone = smoothstep(0.38, 0.40, r) * (1.0 - smoothstep(0.97, 0.985, r));
    float gap = smoothstep(0.485, 0.497, abs(fract(r * 7.0) - 0.5)) * zone;

    vec3 col = vec3(0.018, 0.018, 0.022) + g * 0.01 + gap * 0.035;
    float lobe = pow(abs(cos(a - 0.9)), 26.0);
    float lobe2 = pow(abs(cos(a + 0.5)), 60.0);
    col += zone * (uTint * lobe * 0.3 + vec3(0.7, 0.75, 1.0) * lobe2 * 0.12);
    col += zone * uTint * lobe * g * 0.08;
    col += vec3(0.08) * smoothstep(0.975, 0.995, r);

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,214,140,1)');
  g.addColorStop(0.35, 'rgba(255,170,90,0.45)');
  g.addColorStop(1, 'rgba(255,140,80,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Piringan hitam raksasa yang melayang di atas laut.
 * Label tengahnya = logo SDGS. Berputar 33⅓ rpm saat wave to earth diputar.
 */
export function createVinyl(labelTexture: THREE.Texture) {
  const R = 2.2;
  const H = 0.07;
  const LABEL_R = 0.8;
  const BASE_Y = 3;

  const root = new THREE.Group();
  root.position.set(0, BASE_Y, 0);

  const disc = new THREE.Group();
  disc.rotation.x = Math.PI / 2; // sumbu putar menghadap kamera (+Z)
  root.add(disc);

  const spinner = new THREE.Group();
  disc.add(spinner);

  const faceMat = new THREE.ShaderMaterial({
    uniforms: { uRot: { value: 0 }, uTint: { value: palette.sun.clone() } },
    vertexShader: faceVertex,
    fragmentShader: faceFragment,
  });

  const faceGeo = new THREE.CircleGeometry(R, 128);
  const front = new THREE.Mesh(faceGeo, faceMat);
  front.rotation.x = -Math.PI / 2;
  front.position.y = H / 2;
  const back = new THREE.Mesh(faceGeo, faceMat);
  back.rotation.x = Math.PI / 2;
  back.position.y = -H / 2;

  const edge = new THREE.Mesh(
    new THREE.CylinderGeometry(R, R, H, 128, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.3, metalness: 0.4 }),
  );

  labelTexture.colorSpace = THREE.SRGBColorSpace;
  labelTexture.repeat.set(0.8, 0.8);
  labelTexture.offset.set(0.1, 0.09);
  const labelMat = new THREE.MeshBasicMaterial({ map: labelTexture, toneMapped: false });
  const labelGeo = new THREE.CircleGeometry(LABEL_R, 64);
  const labelFront = new THREE.Mesh(labelGeo, labelMat);
  labelFront.rotation.x = -Math.PI / 2;
  labelFront.position.y = H / 2 + 0.002;
  const labelBack = new THREE.Mesh(labelGeo, labelMat);
  labelBack.rotation.x = Math.PI / 2;
  labelBack.position.y = -H / 2 - 0.002;

  const ringMat = new THREE.MeshBasicMaterial({ color: palette.gold, toneMapped: false });
  const ringGeo = new THREE.RingGeometry(LABEL_R, LABEL_R + 0.045, 64);
  const ringFront = new THREE.Mesh(ringGeo, ringMat);
  ringFront.rotation.x = -Math.PI / 2;
  ringFront.position.y = H / 2 + 0.003;
  const ringBack = new THREE.Mesh(ringGeo, ringMat);
  ringBack.rotation.x = Math.PI / 2;
  ringBack.position.y = -H / 2 - 0.003;

  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.05, 24), new THREE.MeshBasicMaterial({ color: 0x050505 }));
  hole.rotation.x = -Math.PI / 2;
  hole.position.y = H / 2 + 0.004;

  spinner.add(front, back, edge, labelFront, labelBack, ringFront, ringBack, hole);

  // cahaya hangat di belakang piringan
  const glowMat = new THREE.SpriteMaterial({
    map: glowTexture(),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.35,
  });
  const glow = new THREE.Sprite(glowMat);
  glow.scale.setScalar(8);
  glow.position.set(0, 0, -0.8);
  root.add(glow);

  let spinSpeed = 0.25;
  let hover = 0;

  return {
    object: root,
    hitTargets: [front, back, edge, labelFront, labelBack] as THREE.Object3D[],
    update(time: number, dt: number, playing: number, hovered: boolean) {
      // 33⅓ rpm ≈ 3.49 rad/detik saat musik jalan, pelan saat diam
      const target = 0.25 + playing * 3.24;
      spinSpeed += (target - spinSpeed) * (1 - Math.exp(-dt * 1.5));
      spinner.rotation.y -= spinSpeed * dt;
      faceMat.uniforms.uRot.value = spinner.rotation.y;

      hover += ((hovered ? 1 : 0) - hover) * (1 - Math.exp(-dt * 8));
      root.position.y = BASE_Y + Math.sin(time * 0.8) * 0.15;
      disc.rotation.x = Math.PI / 2 - 0.16 + Math.sin(time * 0.6) * 0.04;
      disc.rotation.z = Math.sin(time * 0.5) * 0.06;
      const s = 1 + hover * 0.04;
      disc.scale.setScalar(s);

      glowMat.opacity = 0.3 + hover * 0.15;
    },
  };
}
