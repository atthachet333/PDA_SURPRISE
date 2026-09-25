# A&I relationship-year archive

The private archive uses `yearId` as data, not scene structure. Year boundaries
come from the canonical relationship start (`2025-10-12`) in
`frontend/src/data/relationshipYears.ts`. Calendar state never publishes a
chapter: `releaseState` must be changed deliberately.

## Add media for Year 02 or later

1. Ingest with the EP43 media pipeline (`npm run media:ingest`, see
   [MEDIA_PIPELINE.md](MEDIA_PIPELINE.md)). It creates the local web derivatives
   and the canonical records.
2. Give each item its year in `media.json`: `"yearId": "year-02"` (owner
   override), or an owner-confirmed `"capturedOn"` date, which the pipeline
   resolves through `resolveMediaYear()`. File metadata is never used. An item
   with no owner-supplied year is refused rather than guessed. A year that is not
   declared in `relationshipYears.ts` is refused until it is declared.
3. Add a story placement only when the memory has been intentionally curated;
   ordinary archive additions do not require scene JSX changes.
4. Change the chapter `releaseState` from `preview` to `released` only when its
   archive is ready.
5. Run `npm run media:check`, the tests, and the production build.
