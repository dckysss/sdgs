import * as THREE from 'three';

/** Senja di laut — warna diambil dari logo (hijau, krem, emas) + suasana lagu wave to earth. */
export const palette = {
  skyTop: new THREE.Color('#0a1430'),
  skyMid: new THREE.Color('#3b3270'),
  horizon: new THREE.Color('#ee8a5e'),
  sun: new THREE.Color('#ffc07a'),
  deep: new THREE.Color('#041c24'),
  shallow: new THREE.Color('#0e4a52'),
  gold: new THREE.Color('#f5b82e'),
  cream: new THREE.Color('#f7efd8'),
};

/** Warna malam — tujuan transisi saat menyusuri timeline perjalanan (lihat setNight di scene.ts). */
export const nightPalette = {
  skyTop: new THREE.Color('#03050f'),
  skyMid: new THREE.Color('#0c1433'),
  horizon: new THREE.Color('#23305e'),
  sun: new THREE.Color('#9fb4ff'),
  deep: new THREE.Color('#010a10'),
  shallow: new THREE.Color('#062530'),
};

/** Arah matahari: rendah di cakrawala, di belakang piringan hitam. */
export const SUN_DIR = new THREE.Vector3(0, 0.07, -1).normalize();
