import * as THREE from 'three';

export function createStars(count: number) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const y = 0.08 + Math.pow(Math.random(), 0.7) * 0.92;
    const theta = Math.random() * Math.PI * 2;
    const r = Math.sqrt(1 - y * y);
    pos[i * 3] = r * Math.cos(theta) * 450;
    pos[i * 3 + 1] = y * 450;
    pos[i * 3 + 2] = r * Math.sin(theta) * 450;
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uPixelRatio;
      attribute float aSeed;
      varying float vSeed;
      varying float vAlpha;
      void main() {
        vSeed = aSeed;
        vAlpha = smoothstep(0.1, 0.4, normalize(position).y);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = (1.2 + aSeed * 2.2) * uPixelRatio;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying float vSeed;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a *= vAlpha * (0.55 + 0.45 * sin(uTime * (0.8 + vSeed * 2.5) + vSeed * 40.0));
        gl_FragColor = vec4(1.0, 0.95, 0.86, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  points.renderOrder = -9;

  return {
    points,
    setPixelRatio(pr: number) {
      material.uniforms.uPixelRatio.value = pr;
    },
    update(time: number, camera: THREE.Camera) {
      material.uniforms.uTime.value = time;
      points.position.copy(camera.position);
    },
  };
}

/** Kunang-kunang emas yang melayang di atas laut, ikut "berdetak" saat musik diputar. */
export function createFireflies(count: number) {
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 1] = 0.6 + Math.random() * 7.5;
    pos[i * 3 + 2] = -14 + Math.random() * 22;
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uBeat: { value: 0 },
      uColor: { value: new THREE.Color('#ffd27a') },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uBeat;
      attribute float aSeed;
      varying float vBlink;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.3 + aSeed * 12.0) * 0.6;
        p.y += sin(uTime * 0.5 + aSeed * 7.0) * 0.4;
        p.z += cos(uTime * 0.25 + aSeed * 9.0) * 0.6;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float size = (0.5 + aSeed) * (1.0 + uBeat * 0.9);
        gl_PointSize = size * uPixelRatio * 70.0 / -mv.z;
        vBlink = 0.5 + 0.5 * sin(uTime * (0.8 + aSeed * 2.0) + aSeed * 30.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vBlink;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = pow(max(0.0, 1.0 - d * 2.0), 2.2) * (0.3 + 0.7 * vBlink);
        gl_FragColor = vec4(uColor, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;

  return {
    points,
    setPixelRatio(pr: number) {
      material.uniforms.uPixelRatio.value = pr;
    },
    update(time: number, beat: number) {
      material.uniforms.uTime.value = time;
      material.uniforms.uBeat.value = beat;
    },
  };
}
