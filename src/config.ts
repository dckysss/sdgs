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
    /** Lagu pertama dipilih acak dari sini */
    openers: [
      'Kpg-OVlruxU', // Intro + Bad (Official live) — channel @wavetoearth
      'VJhN9D4SM_c', // daisy.
      'QX2dqXr8mOU', // love.
    ],
    /** Sisa playlist: track rilis resmi dari channel "wave to earth - Topic" — tanpa short & video klip */
    tracks: [
      'M7R7-qnTsFw', // seasons
      'EAyY3_xWZYY', // bad
      'QX2dqXr8mOU', // love.
      'VJhN9D4SM_c', // daisy.
      'xt_IlpwNAFo', // light
      'Q-UZygeboOc', // peach eyes
      'hSESOg8Fjh0', // homesick
      'rmtOH_RVm-k', // evening glow
      'hRjC3ek0Oxk', // sunny days
      'dbXa26RwURE', // calla
      'nF_7P3MDkx8', // pueblo
      'yzgbi62XYtM', // nouvelle vague
      'K45Ibt2xKj8', // surf.
      '1fqqXIQL1cg', // gold
      'FWReVTxfzF0', // wave
      'vMHpQH7pbjg', // heaven and hell (track rilis, bukan video klip)
      'vbJVXtq4MC8', // play with earth!
      'MSOd9osDhJg', // annie.
      'F-P7KPVxegY', // cherry flavoured love inside your heart
      'UrvGKN-gKr8', // everything comes and goes
      '4hfH9sdLqQA', // hyang
      '9jIviHdH9F4', // holyland
      'RmL3g0BbR1A', // so real
      '4TuAIO5oRcU', // dried flower
      'ZRiF6CgGaBk', // sunburn
      'MdNSIgmBPbM', // akira
      'BUwTIoZdZn4', // beck.
      'DMYjvn8VLKo', // slow dive
      'qeJFotOjCOM', // are you bored?
    ],
  },
} as const;
