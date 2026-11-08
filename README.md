# SDGS — Santai Dulu Ga Sih?

Website grup mabar SDGS (server Discord **Join ae**). Latar 3D senja di laut dengan piringan hitam raksasa berlabel logo SDGS, yang berputar saat lagu wave to earth diputar.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # hasil di folder dist/
npm run preview    # cek hasil build
```

## Yang perlu diisi

| Apa | File |
| --- | --- |
| Link invite Discord, ID server (opsional, untuk jumlah online live), jumlah member | `src/config.ts` |
| Game lain yang pernah dimainkan | `otherGames` di `src/data/games.ts` |
| Tagline / warna kartu Valorant, GTA V, Roblox | `featuredGames` di `src/data/games.ts` |
| Daftar alasan kalah | `src/data/excuses.ts` |
| Channel Discord yang ditampilkan | `src/data/discord.ts` |
| Lagu pembuka (dipilih acak) & daftar lagu | `music.openers` & `music.tracks` di `src/config.ts` |
| Anggota squad & milestone perjalanan | langsung di `index.html` (section `#squad` dan `#perjalanan`) |

**Jumlah online live (opsional):** di Discord buka *Server Settings → Widget → Enable Server Widget*, salin Server ID ke `guildId`.

## Musik

Lagu diputar lewat **player resmi YouTube**, bukan file MP3. Lagu wave to earth dilindungi hak cipta, jadi file lagunya tidak boleh di-host sendiri di website publik. YouTube dipilih karena embed Spotify tidak menyediakan pengatur volume.

- Lagu pertama dipilih acak dari: Intro + Bad (live), daisy., atau love.
- Lagu berikutnya diambil dari daftar track rilis resmi (channel "wave to earth - Topic"), tanpa short dan tanpa video klip.
- Volume awal 50%.
- Musik mencoba autoplay saat halaman dibuka. Kalau browser memblokirnya (biasanya untuk pengunjung baru), layar loading menampilkan tombol "Login". Satu klik itu langsung menyalakan musik.
- Saat video SDGS Core diputar, musik otomatis dijeda.

## Tech stack

- **Vite 8**: bundler-nya pakai Rolldown dan Oxc, yang ditulis dengan Rust. Build cuma butuh kurang dari 1 detik.
- **Three.js** + shader GLSL kustom (langit, laut Gerstner, alur piringan hitam). Semua grafis dihitung di GPU.
- **TypeScript**, tanpa framework UI. JS-nya sekitar 150 KB gzip.

Kenapa tidak pakai Rust/WASM di runtime? Rendering 3D sudah jalan di GPU lewat WebGL. Kerja JavaScript per frame di sini sangat kecil (cuma update beberapa posisi objek). WASM baru menguntungkan untuk komputasi CPU yang berat, misalnya fisika atau simulasi. Di sini WASM cuma menambah ukuran download dan kerumitan build tanpa bikin halaman lebih cepat.

Optimasi performa yang dipakai:
- Pixel ratio dibatasi, dan resolusi turun otomatis kalau FPS di bawah ±45.
- Kerapatan vertex laut disesuaikan: rapat di dekat kamera, renggang di kejauhan.
- Jumlah partikel dikurangi di HP.
- Script Spotify baru dimuat saat pengunjung mendekati section musik.
- Animasi dikurangi untuk pengunjung yang mengaktifkan *reduced motion*.
- Kalau WebGL tidak didukung, halaman pakai latar gradien statis.

## Deploy ke Vercel

**Cara cepat, tanpa GitHub** (jalankan di folder proyek):

```bash
npx vercel
```

Saat diminta, login lewat browser lalu terima semua pilihan default (Vite akan terdeteksi otomatis). Hasilnya alamat preview. Untuk website utama:

```bash
npx vercel --prod
```

**Cara rapi, update otomatis setiap push:**

1. Buat repo kosong di github.com, lalu push folder ini:
   ```bash
   git remote add origin https://github.com/<username>/sdgs-website.git
   git push -u origin main
   ```
2. Di vercel.com, pilih **Add New → Project** dan import repo tadi. Framework Vite terdeteksi otomatis (build: `npm run build`, output: `dist`).
3. Klik **Deploy**. Setiap push berikutnya ke `main` akan langsung ter-deploy.

Alternatif: Netlify dengan pengaturan yang sama, atau drag-and-drop folder `dist` ke app.netlify.com/drop.
