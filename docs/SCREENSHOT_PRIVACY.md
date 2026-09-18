# Portfolio screenshot privacy review

Every screenshot of a real system must pass this review **before** it is added
to `frontend/public/images/work/` and listed in `portfolio.ts`.

## Current status

**No portfolio screenshots exist in this repository yet.** The working tree
contains no image files other than `frontend/public/brand/favicon.svg`. Nothing
has therefore been audited, because there is nothing to audit — this document is
the gate for when the owner supplies them.

`portfolio.ts` reflects that: every item except the PDA BLISS site itself has
`publicSafe: false` and an empty `screenshots[]`.

## Never publish

- Login email addresses, usernames, or any pre-filled credential field
- Passwords, tokens, API keys, session ids — including in a browser URL bar
- Employee names, ID numbers, salaries, payslips, addresses, phone numbers
- Customer names, contract values, prices, or any client-confidential figure
- Internal hostnames or private URLs where exposure would be inappropriate
- Anything covered by an NDA with the client

Payroll and HR systems are the highest risk: a single dashboard screenshot can
expose salary data for named employees.

## Review checklist

For each candidate image:

- [ ] Every text field checked, including placeholder text and tooltips
- [ ] Browser chrome checked — URL bar, tab title, autofill dropdowns, bookmarks
- [ ] Table rows checked to the bottom of the visible area, not just the header
- [ ] Any real person's name replaced with obvious sample data
- [ ] Any real monetary figure replaced or removed
- [ ] Login and account screens excluded entirely, or fields fully masked
- [ ] Client permission obtained before their name or branding appears
- [ ] What was changed recorded in the screenshot's `redactions` field

## Masking methods, in order of preference

1. **Re-capture with seeded sample data.** Safest — nothing real is ever in the
   file.
2. **Crop out** the private region entirely.
3. **Replace** the text with plausible sample values before capture.
4. **Solid-block mask.** Acceptable.
5. **Blur.** Weakest option. Light blur on small text can be reversible; use a
   heavy blur or prefer a solid block.

Never rely on an overlay in a layered file — flatten the exported image.

## Gate

Only once every screenshot for an item is reviewed may that item be set to
`publicSafe: true`. `publicPortfolio` filters on `publicSafe && verified`, so an
unreviewed item cannot reach a page by accident.
