---
version: 1
slug: "app-main-layout-tsx"
primary_target: "app/(main)/layout.tsx"
related_targets: ["app/(main)","components/sidebar.tsx","components/grade-selector-button.tsx","components/mobile-header.tsx"]
---

# Surface: learner app (`app/(main)`)

Mode: Operate. Audience: Vietnamese children in grades 1–5, often with a parent nearby, on laptops, tablets and phones. Tasks: pick a grade and topic, open word/sentence cards, play a lesson (select image, multiple choice, matching, listening, pronunciation), review practice history, check the leaderboard, edit the profile. Frequency: daily, short sessions. Constraints: keep all routes, data flow and behaviour; Vietnamese UI with short English echo lines; big targets; no invented stats; state colours only green/sky/red/yellow. Scope agreed with the user: shell → lesson player → learn cards → practice/leaderboard/profile; admin only inherits tokens.

## Direction contract

THESIS: The learner app is the working pages of the homepage's sticker book: a lime desk, white pages to work on, and controls a child wants to press. It refuses the stock shadcn dashboard of grey-bordered cards with flat full-width colour bars.
OWN-WORLD: Lime ground (#E9F9DF) under every learner page, white sheets with 2px slate edges and ink-tinted lifts, die-cut cover stickers (white border, slight tilt) for topic art, Nunito 900 headings with an English echo in Sky Blue Deep, every pressable on a 4px ledge that sinks on press, sky for listen/select, green for go/correct, red for speak/wrong, yellow for reward (XP, streak).
STORY: The child sees which grade they are in and how much XP and streak they have, picks a topic sticker, and starts words, sentences or a lesson in one press; in a lesson they always know progress, hearts and what to press next.
FIRST VIEWPORT: Desktop: white 256px sidebar (mascot + Forest Green wordmark, ledged active item) left; lime work area right with a toolbar row (grade chips Lớp 1–5 as 3D chips, active in sky; XP and streak pills and the profile avatar at right), then the page heading + echo and its one secondary action, then the content sheet/grid. Mobile: a white top bar (menu, mascot, XP/streak), grade chips in their own full-width row, one column.
FORM: Code-led extension of the established sticker-book world to existing Operate surfaces; structures kept, re-composed in the world's vocabulary. seed: none (pinned) — "Redesign the rest of the 4KidStudy web app (apps/web) to match the new homepage". Signature interaction: the answer check in the lesson player (correct choice lifts and turns green with a ledge, wrong choice nudges sideways and turns red; footer sheet slides up in the matching hue). Motion grammar: 150 ms state changes, ease-peel (cubic-bezier(0.16,1,0.3,1)) for lifts, all motion off under reduced motion.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
