import type { AttemptAnswer, Exercise } from "@/types";

export type LessonProgress = {
  version: typeof VERSION;
  savedAt: number;
  exerciseIds: number[];
  activeIndex: number;
  answers: AttemptAnswer[];
  exerciseAttempts: Record<number, number>;
  stats: {
    totalPoints: number;
    correctCount: number;
    wrongCount: number;
    skippedCount: number;
    totalExercises: number;
    elapsedSec: number;
  };
};

const VERSION = 1;
const KEY_PREFIX = "4kid:lesson-progress";
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

const keyFor = (userId: number, lessonId: number) => `${KEY_PREFIX}:${userId}:${lessonId}`;

const sameIds = (a: number[], b: number[]) =>
  a.length === b.length && a.every((id, i) => id === b[i]);

export function readLessonProgress(
  userId: number,
  lessonId: number,
  exercises: Exercise[],
): LessonProgress | null {
  const key = keyFor(userId, lessonId);
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    const progress = JSON.parse(raw) as LessonProgress;
    const isValid =
      progress?.version === VERSION &&
      Date.now() - progress.savedAt < MAX_AGE_MS &&
      Array.isArray(progress.answers) &&
      progress.answers.length > 0 &&
      progress.activeIndex >= 0 &&
      progress.activeIndex <= exercises.length &&
      sameIds(
        progress.exerciseIds,
        exercises.map((e) => e.id),
      );

    if (!isValid) {
      window.localStorage.removeItem(key);
      return null;
    }
    return progress;
  } catch {
    return null;
  }
}

export function hasLessonProgress(userId: number, lessonId: number): boolean {
  try {
    const raw = window.localStorage.getItem(keyFor(userId, lessonId));
    if (!raw) return false;
    const progress = JSON.parse(raw) as LessonProgress;
    return progress?.version === VERSION && Date.now() - progress.savedAt < MAX_AGE_MS;
  } catch {
    return false;
  }
}

export function writeLessonProgress(
  userId: number,
  lessonId: number,
  progress: Omit<LessonProgress, "version" | "savedAt">,
) {
  try {
    window.localStorage.setItem(
      keyFor(userId, lessonId),
      JSON.stringify({ ...progress, version: VERSION, savedAt: Date.now() }),
    );
  } catch {}
}

export function clearLessonProgress(userId: number, lessonId: number) {
  try {
    window.localStorage.removeItem(keyFor(userId, lessonId));
  } catch {}
}
