export interface FeaturedGame {
  name: string;
  /** Teks besar samar di belakang kartu */
  short: string;
  genre: string;
  tagline: string;
  tags: string[];
  /** [warna atas, warna bawah] gradasi kartu */
  colors: [string, string];
  accent: string;
  glyph: 'crosshair' | 'wanted' | 'lanes' | 'castle';
}

/** Game utama yang paling sering dimainkan SDGS. */
export const featuredGames: FeaturedGame[] = [
  {
    name: 'Valorant',
    short: 'VALO',
    genre: 'Tactical FPS · 5v5',
    tagline: 'Satu clutch bisa bikin voice channel teriak berjamaah.',
    tags: ['5v5', 'Tactical shooter', 'Riot Games'],
    colors: ['#ff4655', '#2a0a12'],
    accent: '#ffd5d9',
    glyph: 'crosshair',
  },
  {
    name: 'GTA V',
    short: 'GTA',
    genre: 'Open world · Online',
    tagline: 'Rencana heist rapi, eksekusinya… ya gitu deh.',
    tags: ['Open world', 'GTA Online', 'Rockstar Games'],
    colors: ['#f39a5b', '#3a1d4d'],
    accent: '#ffe7c9',
    glyph: 'wanted',
  },
  {
    name: 'Mobile Legends',
    short: 'MLBB',
    genre: 'MOBA · 5v5',
    tagline: 'Rebutan Lord sampai lupa base tinggal satu tower.',
    tags: ['5v5', 'MOBA', 'Moonton'],
    colors: ['#d9a441', '#1d1636'],
    accent: '#fff0cf',
    glyph: 'lanes',
  },
  {
    name: 'Clash of Clans',
    short: 'COC',
    genre: 'Strategy · Clan War',
    tagline: 'Clan kami: Sunib Ganteng. War jalan terus, base tetap santai.',
    tags: ['Clan: Sunib Ganteng', 'Strategy', 'Supercell'],
    colors: ['#5aa832', '#10261a'],
    accent: '#e3f7d2',
    glyph: 'castle',
  },
];

/**
 * Game lain yang pernah dimainkan — tinggal tambahkan nama di sini, contoh:
 * export const otherGames = ['Minecraft', 'Apex Legends', 'Rainbow Six Siege'];
 */
export const otherGames: string[] = ['Roblox', 'Black Myth: Wukong'];
