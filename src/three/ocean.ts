import * as THREE from 'three';
import { palette, SUN_DIR } from './palette';

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying float vCrest;

  const float PI = 3.141592653589793;

  // Gelombang Gerstner: puncak lebih tajam dari sinus biasa, terasa seperti ombak sungguhan.
  vec3 gerstner(vec4 w, vec2 p, float fade, inout vec3 T, inout vec3 B) {
    float k = 2.0 * PI / w.w;
    float c = sqrt(9.8 / k);
    vec2 d = normalize(w.xy);
    float s = w.z * fade * uAmp;
    float f = k * (dot(d, p) - c * uTime * 0.35);
    float a = s / k;
    float sf = sin(f), cf = cos(f);
    T += vec3(-d.x * d.x * s * sf, d.x * s * cf, -d.x * d.y * s * sf);
    B += vec3(-d.x * d.y * s * sf, d.y * s * cf, -d.y * d.y * s * sf);
    return vec3(d.x * a * cf, a * sf, d.y * a * cf);
  }

  void main() {
    vec3 p = position;
    float dist = length(p.xz);
    float farFade = 1.0 - smoothstep(30.0, 110.0, dist);
    float nearFade = 1.0 - smoothstep(14.0, 40.0, dist);
    vec3 T = vec3(1.0, 0.0, 0.0);
    vec3 B = vec3(0.0, 0.0, 1.0);
    vec3 disp = vec3(0.0);
    disp += gerstner(vec4(1.0, 0.35, 0.12, 26.0), p.xz, farFade, T, B);
    disp += gerstner(vec4(0.6, 1.0, 0.10, 14.0), p.xz, farFade, T, B);
    disp += gerstner(vec4(-0.5, 0.9, 0.08, 8.0), p.xz, farFade, T, B);
    disp += gerstner(vec4(0.2, -1.0, 0.06, 4.5), p.xz, nearFade, T, B);
    p += disp;
    vCrest = disp.y;
    vNormalW = normalize(cross(B, T));
    vWorld = p;
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uTop;
  uniform vec3 uMid;
  uniform vec3 uHorizon;
  uniform vec3 uSun;
  uniform vec3 uSunDir;
  uniform vec3 uGlow;
  uniform float uTime;
  uniform float uBeat;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec3 vWorld;
  varying vec3 vNormalW;
  varying float vCrest;

  void main() {
    vec3 n = normalize(vNormalW);
    float dist = length(vWorld - cameraPosition);

    // riak kecil supaya pantulan matahari berkilau
    float detail = 1.0 - smoothstep(10.0, 60.0, dist);
    vec2 q = vWorld.xz;
    float t = uTime;
    n.x += detail * 0.06 * (sin(q.x * 1.9 + t * 1.1) + sin(q.x * 0.7 + q.y * 2.3 - t * 1.6));
    n.z += detail * 0.06 * (cos(q.y * 1.7 - t * 1.3) + sin(q.y * 0.9 - q.x * 2.1 + t * 0.9));
    n = normalize(n);

    vec3 v = normalize(cameraPosition - vWorld);
    float ndv = max(dot(n, v), 0.0);
    float fres = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
    vec3 r = reflect(-v, n);
    float ry = max(r.y, 0.0);
    vec3 sky = mix(uHorizon, uMid, smoothstep(0.0, 0.2, ry));
    sky = mix(sky, uTop, smoothstep(0.18, 0.6, ry));

    vec3 water = mix(uDeep, uShallow, clamp(vCrest * 0.7 + 0.35, 0.0, 1.0));
    vec3 col = mix(water, sky, clamp(fres, 0.0, 1.0));

    float sd = max(dot(r, uSunDir), 0.0);
    col += uSun * (pow(sd, 400.0) * 6.0 + pow(sd, 40.0) * 0.35);

    // pantulan cahaya piringan hitam di air
    float glow = exp(-length(vWorld.xz - vec2(0.0, 0.0)) * 0.22);
    col += uGlow * glow * (0.05 + uBeat * 0.12);

    float foam = smoothstep(0.45, 0.8, vCrest) * (1.0 - smoothstep(20.0, 60.0, dist));
    col = mix(col, vec3(0.95, 0.88, 0.82), foam * 0.22);

    float fog = smoothstep(uFogNear, uFogFar, dist);
    col = mix(col, uHorizon, fog);

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createOcean(segments: number) {
  const half = 200;
  const geo = new THREE.PlaneGeometry(2, 2, segments, segments);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  // Rapatkan vertex di dekat kamera, renggangkan di kejauhan: detail tinggi tanpa jutaan vertex.
  const warp = (u: number) => Math.sign(u) * (0.25 * Math.abs(u) + 0.75 * u * u) * half;
  for (let i = 0; i < pos.count; i++) pos.setXY(i, warp(pos.getX(i)), warp(pos.getY(i)));
  geo.rotateX(-Math.PI / 2);
  geo.computeBoundingSphere();

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAmp: { value: 1 },
      uBeat: { value: 0 },
      uDeep: { value: palette.deep },
      uShallow: { value: palette.shallow },
      uTop: { value: palette.skyTop },
      uMid: { value: palette.skyMid },
      uHorizon: { value: palette.horizon },
      uSun: { value: palette.sun },
      uSunDir: { value: SUN_DIR },
      uGlow: { value: palette.gold },
      uFogNear: { value: 30 },
      uFogFar: { value: 190 },
    },
    vertexShader,
    fragmentShader,
  });

  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;

  return {
    mesh,
    update(time: number, beat: number) {
      material.uniforms.uTime.value = time;
      material.uniforms.uBeat.value = beat;
      material.uniforms.uAmp.value = 1 + beat * 0.12;
    },
  };
}
