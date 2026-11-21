# 0016. Lesson player interaction rules

- Status: Accepted
- Date: 2026-11-21

Visual rules for the player are in `apps/web/DESIGN.md`. These are the
behaviour rules.

## Decision

- **Enter is the global "check / continue" key.** Answer tiles call
  `keepEnterForCheck`, so Enter never also activates the focused button and
  one press never acts twice. Space and clicks still work. The resume dialog
  focuses "Làm tiếp", not Radix's default "Làm lại từ đầu", so Enter never
  wipes progress.
- **The verdict colour always shows.** Tiles hover and press only while they
  have no verdict.
- **No hydration mismatch.** Options are shuffled on the client only
  (`useIsClient`). Anything read from `localStorage`, such as saved
  progress, is read after hydration.
- **State resets during render, not in an effect,** when the item changes
  (matching options, flashcards). That avoids a frame of stale state. The
  quiz also renders each question with `key={exercise.id}`, so a recording
  never carries over.
- **Audio elements are always mounted.** `react-use`'s `useAudio` needs its
  element from the first render, so the quiz calls the audio hooks first and
  renders their elements even while it waits for `isReady`.
- **Matching:**
  - The component sets both picks with `selectOptions`. `selectOption` would
    reset the second one.
  - The exercise completes itself once every pair is matched, and the
    submit reads the store at that moment, so the last pair is included.
  - While a wrong pair's red verdict shows, the board is locked until
    Continue. A pair finished in the meantime would be ignored and leave the
    exercise stuck.
  - Completion is reported once per options array.
- **Leaving a recording.** Skipping or exiting mid-recording releases the
  microphone without reporting a "recorded" state to the next question.
