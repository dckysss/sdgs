/**
 * Semua yang perlu kamu ubah ada di sini.
 */
export const config = {
  discord: {
    serverName: 'Join ae',
    /** Link invite server, contoh: 'https://discord.gg/abc123'. Kosong = tombol diarahkan ke section Discord. */
    inviteUrl: '',
    /**
     * Opsional — ID server Discord untuk jumlah member online secara live.
     * Syarat: Server Settings → Widget → "Enable Server Widget" dinyalakan.
     */
    guildId: '',
    /** Total member (sesuai profil server Discord). Update manual kalau berubah. */
    memberCount: 55,
  },
  /**
   * Musik diputar lewat YouTube (bukan Spotify) karena embed Spotify tidak bisa diatur volumenya.
   * Isinya ID video YouTube (bagian setelah "watch?v=" / "youtu.be/"). Semua sudah dicek bisa di-embed.
   */
  music: {
    /** Lagu pertama dipilih acak dari ID ini (harus ada juga di `tracks`) */
    openers: ['Kpg-OVlruxU', 'VJhN9D4SM_c', 'QX2dqXr8mOU'],
    /**
     * Urutan playlist sekaligus daftar lagu yang bisa dipilih di section Musik.
     * Track rilis resmi "wave to earth - Topic", tanpa short & video klip.
     * `karbit: true` = tampil dicoret & tidak bisa diputar (tidak masuk playlist). Versi rilis biasa "bad" sengaja tidak ada.
     */
    tracks: [
      { id: 'Kpg-OVlruxU', title: 'Intro + Bad (live)' }, // channel @wavetoearth
      { id: 'M7R7-qnTsFw', title: 'seasons', karbit: true },
      { id: 'QX2dqXr8mOU', title: 'love.' },
      { id: 'VJhN9D4SM_c', title: 'daisy.' },
      { id: 'MSOd9osDhJg', title: 'annie.' },
      { id: 'xt_IlpwNAFo', title: 'light' },
      { id: 'Q-UZygeboOc', title: 'peach eyes' },
      { id: 'hSESOg8Fjh0', title: 'homesick' },
      { id: 'rmtOH_RVm-k', title: 'evening glow' },
      { id: 'hRjC3ek0Oxk', title: 'sunny days' },
      { id: 'dbXa26RwURE', title: 'calla' },
      { id: 'nF_7P3MDkx8', title: 'pueblo' },
      { id: 'yzgbi62XYtM', title: 'nouvelle vague' },
      { id: 'K45Ibt2xKj8', title: 'surf.' },
      { id: '1fqqXIQL1cg', title: 'gold' },
      { id: 'FWReVTxfzF0', title: 'wave' },
      { id: 'vMHpQH7pbjg', title: 'heaven and hell' }, // track rilis, bukan video klip
      { id: 'vbJVXtq4MC8', title: 'play with earth!' },
      { id: 'F-P7KPVxegY', title: 'cherry flavoured love inside your heart' },
      { id: 'UrvGKN-gKr8', title: 'everything comes and goes' },
      { id: '4hfH9sdLqQA', title: 'hyang' },
      { id: '9jIviHdH9F4', title: 'holyland' },
      { id: 'RmL3g0BbR1A', title: 'so real' },
      { id: '4TuAIO5oRcU', title: 'dried flower' },
      { id: 'ZRiF6CgGaBk', title: 'sunburn' },
      { id: 'MdNSIgmBPbM', title: 'akira' },
      { id: 'BUwTIoZdZn4', title: 'beck.' },
      { id: 'DMYjvn8VLKo', title: 'slow dive' },
      { id: 'qeJFotOjCOM', title: 'are you bored?' },
    ],
  },
} as const;
