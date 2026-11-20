---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

# Surface: public homepage (`/`)

Mode: Persuade. Audience: Vietnamese parents of grade 1–5 children deciding whether to create an account; the child is often beside them. Action: create an account with the child's grade pre-selected (`/register?grade=n`); returning users log in. Proof: real product mechanisms only (bilingual word cards, grade-based content, pronunciation scoring, practice history, XP/streak). Constraints: bilingual (Vietnamese lead, English alongside); never claim spaced repetition, parent reports, pricing, user counts or curriculum alignment. Inherit the app's world: Nunito, chunky 3D buttons (border-b shadow), green #22C55E / sky #1CB0F6 / yellow #FFC800 / red #FF4B4B on slate ink #3D465D, mascot mark.

## Direction contract

THESIS: The homepage is one sheet of English word stickers a child wants to peel; it refuses the split hero with a stock illustration and a row of three feature cards.
OWN-WORLD: Pale lime ground (#E9F9DF), a white die-cut sheet rising from the bottom edge, stickers as saturated fields with 7px white borders and soft drop shadows, drawn flat SVG subjects, Nunito 900 headlines, the app's 3D green/white buttons.
STORY: The parent sees what the child learns (real words, Vietnamese meaning, voice), believes it is made for Vietnamese kids by grade, and picks the child's grade to sign up.
FIRST VIEWPORT: Nav top. Left column: bilingual headline, one-line English echo, short paragraph, primary "Bắt đầu học" button, grade picker Lớp 1–5 as 3D chips linking to /register?grade=n. Right two-thirds: the sticker sheet, 8 word stickers in a 4x2 grid with one sticker (cat) peeled up and tilted showing phonetic, Vietnamese meaning and a play button.
FORM: Word sticker sheet, position 7 of 7 on the ordered list, seed:20b87934cf76bf40. Signature interaction: tap a sticker to flip it to its Vietnamese side and hear the word (speech synthesis); motion grammar: a peel-lift with exponential ease-out, reduced-motion respected.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
