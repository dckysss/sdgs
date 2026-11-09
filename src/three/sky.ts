import * as THREE from 'three';
import { palette, SUN_DIR } from './palette';

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uSun;
  uniform vec3 uSunDir;
  uniform float uTime;
  varying vec3 vDir;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }

  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;

    vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.22, h));
    col = mix(col, uTop, smoothstep(0.2, 0.75, h));
    if (h < 0.0) col = uHorizon;

    float sd = max(dot(d, uSunDir), 0.0);
    col += uSun * (pow(sd, 6.0) * 0.35 + pow(sd, 48.0) * 0.6);

    // awan tipis memanjang di dekat cakrawala
    if (h > 0.0) {
      vec2 cuv = d.xz / (h + 0.1);
      cuv = cuv * vec2(0.22, 0.6) + vec2(uTime * 0.006, 0.0);
      float c = fbm(cuv);
      float mask = smoothstep(0.52, 0.8, c) * smoothstep(0.01, 0.06, h) * (1.0 - smoothstep(0.22, 0.45, h));
      vec3 cc = mix(vec3(0.95, 0.55, 0.5), uSun, pow(sd, 3.0));
      cc *= smoothstep(0.02, 0.35, dot(uHorizon, vec3(0.299, 0.587, 0.114))); // awan ikut gelap saat malam
      col = mix(col, cc * 0.9, mask * 0.45);
    }

    float disk = smoothstep(0.9988, 0.9993, sd);
    col = mix(col, vec3(1.0, 0.9, 0.7) * 1.4, disk);

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createSky() {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTop: { value: palette.skyTop },
      uMid: { value: palette.skyMid },
      uHorizon: { value: palette.horizon },
      uSun: { value: palette.sun },
      uSunDir: { value: SUN_DIR },
      uTime: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 24), material);
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;

  return {
    mesh,
    update(time: number, camera: THREE.Camera) {
      material.uniforms.uTime.value = time;
      mesh.position.copy(camera.position);
    },
  };
}
