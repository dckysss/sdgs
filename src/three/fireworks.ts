import * as THREE from 'three';

const PERIOD = 3.2; // detik sampai satu ledakan diulang
const LIFE = 1.8; // detik satu ledakan terlihat

/** Kembang api tahun baru di atas laut — klimaks timeline (31 Desember). Semua gerak dihitung di GPU. */
export function createFireworks(bursts: number, perBurst: number) {
  const n = bursts * perBurst;
  const pos = new Float32Array(n * 3);
  const vel = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const off = new Float32Array(n);
  const colors = ['#f5b82e', '#ff7a59', '#7fe0ff', '#ff8fd1', '#f7efd8'].map((c) => new THREE.Color(c));
  const dir = new THREE.Vector3();

  for (let b = 0; b < bursts; b++) {
    const ox = 4 + Math.random() * 26; // langit kanan atas: kiri tertutup kartu timeline, tengah tertutup piringan
    const oy = 10 + Math.random() * 5;
    const oz = -22 - Math.random() * 12;
    const c = colors[b % colors.length];
    const o = (b / bursts) * PERIOD + Math.random() * 0.3;
    const speed = 3.6 + Math.random() * 1.6;
    for (let i = 0; i < perBurst; i++) {
      const k = b * perBurst + i;
      dir.randomDirection().multiplyScalar(speed * (0.85 + Math.random() * 0.15));
      pos.set([ox, oy, oz], k * 3);
      vel.set([dir.x, dir.y, dir.z], k * 3);
      col.set([c.r, c.g, c.b], k * 3);
      off[k] = o;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aVel', new THREE.BufferAttribute(vel, 3));
  geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aOffset', new THREE.BufferAttribute(off, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uIntensity: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uIntensity;
      attribute vec3 aVel;
      attribute vec3 aColor;
      attribute float aOffset;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float t = mod(uTime - aOffset, ${PERIOD.toFixed(1)});
        float life = clamp(t / ${LIFE.toFixed(1)}, 0.0, 1.0);
        vec3 p = position + aVel * t * (1.0 - 0.35 * life) + vec3(0.0, -1.4, 0.0) * t * t;
        vAlpha = (1.0 - life) * step(t, ${LIFE.toFixed(1)}) * uIntensity;
        vColor = aColor;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (2.0 + 3.0 * (1.0 - life)) * uPixelRatio * 110.0 / -mv.z;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = pow(max(0.0, 1.0 - d * 2.0), 1.6) * vAlpha;
        gl_FragColor = vec4(vColor * 2.2, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  points.visible = false;

  return {
    points,
    setPixelRatio(pr: number) {
      material.uniforms.uPixelRatio.value = pr;
    },
    update(time: number, intensity: number) {
      points.visible = intensity > 0.01;
      material.uniforms.uTime.value = time;
      material.uniforms.uIntensity.value = intensity;
    },
  };
}
