export interface Channel {
  name: string;
  type: 'text' | 'voice' | 'stats';
  active?: boolean;
}

export interface Category {
  name: string;
  collapsed?: boolean;
  channels: Channel[];
}

/** Struktur channel server "Join ae" (sesuai tampilan Discord). */
export const categories: Category[] = [
  { name: 'Server Stats 📊', channels: [{ name: 'members', type: 'stats' }] },
  {
    name: 'Welcoming',
    channels: [
      { name: 'general', type: 'text', active: true },
      { name: 'music', type: 'text' },
      { name: 'share', type: 'text' },
    ],
  },
  {
    name: 'General',
    channels: [
      { name: 'YWWA', type: 'voice' },
      { name: 'default', type: 'voice' },
      { name: 'penjara', type: 'voice' },
      { name: 'nyanyi di sini aja karbit', type: 'voice' },
      { name: 'chill', type: 'voice' },
    ],
  },
  { name: 'nugas', collapsed: true, channels: [] },
];
