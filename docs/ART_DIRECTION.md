# Art direction lock

Recorded during the pre-redesign content lock. **Nothing in this document has
been implemented yet** — it is the brief for the redesign pass that follows.

Both sites keep their current visual behaviour until that pass begins.

---

## PDA BLISS — "Gen-Z Enterprise Software House"

**Reference inspiration:** `24framework.co.th`

Inspiration only. Do not clone the reference — no copied layouts, no copied
copy, no copied section order. Take the energy, not the artefact.

### Direction

| Aspect | Intent |
| --- | --- |
| Typography | Bold, large, confident. Type is the primary visual element. |
| Narrative | Strong throughline. The page argues something, it does not list features. |
| Language | Thai-first. English appears as small technical secondary labels. |
| Motion | Kinetic text; scroll-driven section transitions. |
| Structure | Fewer repetitive card grids. Sections should differ from each other. |
| Work | Strong Work showcase — this is the centre of gravity, not an afterthought. |
| Diagrams | Interactive system visuals rather than static illustration. |
| Palette | Green / white / black — the existing PDA BLISS identity. |
| Tone | Modern and bold, but still legibly trustworthy to an enterprise buyer. |

### Constraints carried over

- Contact details come from `frontend/src/data/company.ts` only. No component
  may contain a literal phone number, email, LINE id or address.
- The only publishable numbers are in `metrics` (6 software systems,
  4 websites). Everything else stays gated. See `docs/CONTENT_LOCK.md`.
- The seven primary services in `data/services.ts` lead with their Thai
  `title`; `nameEn` is the small secondary label.

---

## A&I — "Celestial Cinematic Storytelling"

**Reference inspiration:** Tigersary storytelling structure

Inspiration only — structural reference for how a story is paced, not a
template to reproduce.

### Direction

| Aspect | Intent |
| --- | --- |
| World | Space. Orbit. A constellation of memories. Planets and stars. |
| Palette | Sky blue, white, cream, soft navy, with a subtle champagne highlight. |
| Structure | Story sections that are easy to follow, with clear navigation. |
| Language | Thai-first emotional copy, in the owner's own voice. |
| Motion | Cinematic. Always some subtle movement, never static. |
| Pacing | The final message is paced across several screens, never dumped on one. |

### Constraints carried over

- `relationshipStartDate` (`2025-10-12`) is the single source for every
  counter. Nothing may hardcode a day count.
- The final message is stored as beats in
  `anniversary.finalMessages.segments` — `opening`, `gratitude[]`,
  `reflection[]`, `future[]`, `closing[]`. Preserve the owner's wording; do not
  smooth it into marketing prose.
- No captions may be written for photographs nobody has seen. Image slots carry
  an `intent`, not a caption.
- No coordinate may be guessed. See `journey.*.coordinatesPending`.
- The experience must run correctly with no audio file present.
