# Audio

**No audio files are committed to this repository.** Everything below is
optional — the experience runs correctly, and silently, with this folder empty.

## 1. The main track

The owner's chosen track is **"A Thousand Years"**. That recording is
copyrighted, so **no audio file is committed here** and none will be added
automatically. The owner supplies a lawfully obtained private copy at:

```
frontend/public/audio/main-track.mp3
```

That is the whole setup. The path lives in `src/data/anniversary.ts` under
`audio.musicSrc` if you want to change it.

Until a file exists:

- the music toggle in the A&I navigation stays inactive and is labelled
  "No music file added yet";
- nothing throws and nothing is logged;
- the interface still makes sound (see below).

## 2. Sound effects (optional)

Drop any of these into `frontend/public/audio/sfx/`:

```
hover.mp3       pointer entering an interactive element
click.mp3       button presses and scene navigation
whoosh.mp3      entering a scene, opening the portal
impact.mp3      the DAY 365 reveal, the 365 convergence
sparkle.mp3     opening a memory
transition.mp3  archive / state changes in the finale
```

Each file is independent. **Any effect without a file falls back to a
synthesised tone generated with the Web Audio API**, which is why the
repository ships with no audio binaries at all and still has interface sound.

## 3. Syncing animation to the music

`src/data/anniversary.ts` exports `audio.cues` — `{ id, time }` pairs in
seconds:

```ts
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
```

Adjust the times to match your track and the scenes follow it. A scene
subscribes like this:

```ts
const { onCue } = useAudio();
useEffect(() => onCue('day365', () => setRevealed(true)), [onCue]);
```

**Important:** every scene also triggers its own beat from scroll position, so
the experience is identical with music disabled, with no track present, or with
a track of any length. Navigation never depends on song timing.

## 4. How the audio system behaves

- **No autoplay.** Nothing plays until the visitor's own gesture — the
  story-entry click, or the first-visit "Sound on" choice.
- **Fades only.** Music never starts or stops abruptly; every change is a ramp.
- **Ducking.** The quiet scene pulls music down to ~32%, the finale opens it
  back to full over four seconds.
- **Preferences persist** in `localStorage` under `ai:audio` (music on/off,
  effects on/off, and the three volume levels).
- **Backgrounded tabs pause** the music and resume it on return.

## Licensing

Do not commit copyrighted audio to this repository. Add your track locally, or
serve it from storage you control.
