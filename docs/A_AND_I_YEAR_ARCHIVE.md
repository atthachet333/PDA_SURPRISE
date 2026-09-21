# A&I relationship-year archive

The private archive uses `yearId` as data, not scene structure. Year boundaries
come from the canonical relationship start (`2025-10-12`) in
`frontend/src/data/relationshipYears.ts`. Calendar state never publishes a
chapter: `releaseState` must be changed deliberately.

## Add media for Year 02 or later

1. Run the existing safe media-curation pipeline and create local web derivatives.
2. Assign `yearId` in the generated photo/video record (`year-02`, `year-03`, …).
   Capture date may suggest a year, but an explicit owner override wins. Keep
   undated or uncertain media as `unassigned` until the owner decides.
3. Add a story placement only when the memory has been intentionally curated;
   ordinary archive additions do not require scene JSX changes.
4. Change the chapter `releaseState` from `preview` to `released` only when its
   archive is ready.
5. Run tests, validation, and the production build.

The later automated pipeline may call `resolveMediaYear()` with capture date,
owner override, and an optional release fallback. It must not treat metadata as
stronger evidence than owner truth.
