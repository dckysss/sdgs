import * as THREE from 'three';

/** Easter egg: kata-kata yang cuma dimengerti member SDGS, melayang lewat di section masing-masing. */
const words: Array<{ text: string; section: string; pos: [number, number, number]; phase: number }> = [
  // pos = titik muncul di atas laut, di area kosong section itu; kata lalu naik dan memudar
  { text: 'tingkan tingkir', section: 'about', pos: [-2.2, 0.2, 4], phase: 0 },
  { text: 'rure', section: 'journey', pos: [3.5, 1.0, -3], phase: 0.1 },
  { text: 'rugi', section: 'journey', pos: [2.5, 0.8, 2], phase: 0.55 },
  { text: 'pede gw, menang ini', section: 'games', pos: [7, 5, 0.8], phase: 0.75 },
  { text: 'nopel pek', section: 'music', pos: [-3.8, 1.2, -4], phase: 0.3 },
];

function drawText(text: string) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const draw = () => {
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.font = '120px "Lilita One", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // garis tepi gelap supaya terbaca di langit terang maupun laut gelap
    ctx.lineJoin = 'round';
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(6, 19, 24, 0.55)';
    ctx.strokeText(text, c.width / 2, c.height / 2);
    ctx.shadowColor = 'rgba(245, 184, 46, 0.9)';
    ctx.shadowBlur = 36;
    ctx.fillStyle = '#f7efd8';
    ctx.fillText(text, c.width / 2, c.height / 2);
    tex.needsUpdate = true;
  };
  draw();
  document.fonts?.load('120px "Lilita One"').then(draw, () => {}); // gambar ulang setelah font siap
  return tex;
}

/** narrow = HP: kamera selalu ke tengah dengan bidang pandang sempit, jadi kata dirapatkan ke tengah. */
export function createWhispers(sectionNames: string[], narrow: boolean) {
  const xMul = narrow ? 0 : 1;
  const group = new THREE.Group();
  const items = words.map((w) => {
    // depthTest off + renderOrder tinggi: kata tidak tertutup benda 3D yang mengorbit
    const material = new THREE.SpriteMaterial({ map: drawText(w.text), transparent: true, depthWrite: false, depthTest: false, opacity: 0 });
    const sprite = new THREE.Sprite(material);
    sprite.renderOrder = 10;
    sprite.scale.set(narrow ? 2.4 : 3.2, narrow ? 0.6 : 0.8, 1);
    group.add(sprite);
    return { ...w, sprite, material, index: sectionNames.indexOf(w.section) };
  });

  return {
    group,
    /** f = posisi scroll dalam satuan section (0 = section pertama) */
    update(time: number, f: number) {
      for (const it of items) {
        // penuh selama layar masih di dalam section-nya (|f - index| < 0.3), hilang di batas section
        const near = Math.min(1, Math.max(0, (0.55 - Math.abs(f - it.index)) / 0.25));
        const t = (time * 0.08 + it.phase) % 1; // satu kali "lewat" ≈ 12 detik
        it.sprite.position.set(
          it.pos[0] * xMul + Math.sin(time * 0.2 + it.phase * 6) * 0.6 * xMul,
          it.pos[1] + t * 2,
          it.pos[2],
        );
        it.material.opacity = 0.85 * Math.sin(Math.PI * t) * near;
        it.sprite.visible = it.material.opacity > 0.01;
      }
    },
  };
}
