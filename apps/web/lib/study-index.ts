/** Turns a `?index=` value into a card index that is safe to read for a list of `length`. */
export function clampStudyIndex(raw: string | null, length: number): number {
  const index = Number.parseInt(raw ?? "0", 10);
  if (Number.isNaN(index) || length === 0) {
    return 0;
  }
  return Math.min(Math.max(index, 0), length - 1);
}

/**
 * Where "continue" should open. The saved index is the furthest card the child tried, so
 * when that card is already finished, start on the one after it instead.
 */
export function resumeStudyIndex(index: number, length: number, isFinished: boolean): number {
  return isFinished && index < length - 1 ? index + 1 : index;
}
