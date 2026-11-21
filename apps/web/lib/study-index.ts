export function clampStudyIndex(raw: string | null, length: number): number {
  const index = Number.parseInt(raw ?? "0", 10);
  if (Number.isNaN(index) || length === 0) {
    return 0;
  }
  return Math.min(Math.max(index, 0), length - 1);
}

export function resumeStudyIndex(index: number, length: number, isFinished: boolean): number {
  return isFinished && index < length - 1 ? index + 1 : index;
}
