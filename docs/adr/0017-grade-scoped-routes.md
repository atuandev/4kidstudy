# 0017. Grade-scoped routes

- Status: Accepted
- Date: 2026-11-21

## Decision

- Practice and units live under `/grade/[grade]/...` (`practice`,
  `learn/units`). The shared layout rejects unknown grades and shows the
  grade selector above the page.
- The old grade-less URLs (`/practice`, `/learn/units`) stay for existing
  links. `redirectToGrade` sends them to the grade-scoped page, taking the
  grade from the legacy `?grade=GRADE_N`, then the student's profile, then
  grade 1. `buildGradeHref` falls back to the grade-less URL for an unknown
  grade, so it lands on the student's own grade.
- Choosing a grade on a grade page swaps only the grade segment, so the
  student stays in the same section. Elsewhere it opens that grade's units.
- Navigation keeps the current grade in view. A section stays highlighted
  on its sub-pages (a topic's flashcards, the learn index).
- The homepage grade picker opens `/register?grade=N`, which pre-selects
  that grade.
