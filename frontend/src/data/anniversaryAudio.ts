/** Shared runtime audio configuration; contains no relationship/archive data. */
export const anniversaryAudio = {
  musicSrc: '/audio/main-track.mp3',
  sfxDir: '/audio/sfx',
  sfxFiles: [] as string[],
  defaultMasterVolume: 0.75,
  defaultMusicVolume: 0.62,
  defaultSfxVolume: 0.32,
  sceneMix: {
    entry: { level: 0.7, ms: 1800 },
    days: { level: 0.78, ms: 1400 },
    beginning: { level: 0.84, ms: 1600 },
    'little-moments': { level: 0.88, ms: 1400 },
    journey: { level: 0.92, ms: 1600 },
    memories: { level: 0.95, ms: 1800 },
    places: { level: 0.88, ms: 1400 },
    life: { level: 0.78, ms: 1600 },
    stats: { level: 0.83, ms: 1200 },
    quiet: { level: 0.42, ms: 3500 },
    converge: { level: 0.98, ms: 3200 },
    letter: { level: 0.56, ms: 2600 },
    final: { level: 0.9, ms: 3000 }
  } as Record<string, { level: number; ms: number }>,
  cues: [
    { id: 'entry', time: 0 },
    { id: 'dayStart', time: 18 },
    { id: 'day365', time: 42 },
    { id: 'memoryUniverse', time: 68 },
    { id: 'journey', time: 104 },
    { id: 'gallery', time: 138 },
    { id: 'tunnel', time: 172 },
    { id: 'timeline', time: 206 },
    { id: 'quietScene', time: 236 },
    { id: 'convergence', time: 262 },
    { id: 'finale', time: 292 }
  ]
} as const;
