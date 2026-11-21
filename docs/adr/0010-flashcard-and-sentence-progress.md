# 0010. Flashcard and sentence progress

- Status: Accepted
- Date: 2026-11-21

## Decision

**Mastery.** A card or sentence is reviewed once its pronunciation check
passes (score above 50), and `isMastered` is then set. The client only ever
sends `isMastered: true`, so a failed retry can't un-master a card that
already passed.

**Topic progress** (`buildTopicProgress`). Progress is built from a topic's
active content, sorted by `order`. An item counts as reviewed when it is
mastered. The "last reviewed" index is the furthest item the user has any
progress row for. `getTopicsProgressByGrade` runs a fixed number of queries,
however many topics the grade has.

**Learner lists are active-only.** The study pages load active cards and
images only (`activeOnly`), because the saved resume index counts active
items, so the two lists must match.

**Continue and restart:**

- "Continue" opens the furthest card the child tried. If that card is
  already finished, it opens the next one (`resumeStudyIndex`, `?resume`).
- The viewer swaps `?resume` for the card actually opened (`?index=`), so a
  reload stays put. It follows `?index=` on back and forward. Starting over
  clears `?index` too.
- A part at 100% starts again from the first card.

**Grade learning stats** (the progress strip). Totals include inactive
content, which is what the dialog has always shown. Top items are sorted by
review count, and the stable sort keeps the most recently reviewed first on
ties.
