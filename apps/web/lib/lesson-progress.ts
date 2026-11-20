import type { AttemptAnswer, Exercise } from "@/types";

/**
 * An unfinished lesson, saved in this browser so the learner can leave and
 * pick up where they stopped. Nothing reaches the backend until the lesson is
 * finished; the finish page then submits the whole attempt and clears this.
 *
 * Saved per user and lesson, so children sharing a device keep their own
 * progress. A save is dropped when the lesson's exercises change (added,
 * removed or reordered) or when it is older than MAX_AGE_MS.
 */
export type LessonProgress = {
  version: typeof VERSION;
  savedAt: number;
  /** Exercise ids in order when saved; a mismatch means the lesson changed. */
  exerciseIds: number[];
  /** The next exercise to show. Equals exerciseIds.length when all are answered. */
  activeIndex: number;
  answers: AttemptAnswer[];
  exerciseAttempts: Record<number, number>;
  stats: {
    totalPoints: number;
    correctCount: number;
    wrongCount: number;
    skippedCount: number;
    totalExercises: number;
    /** Seconds spent in the lesson so far; time away is not counted. */
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

/** Whether a lesson has saved progress, without checking it against the lesson's exercises. */
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
  } catch {
    // Storage full or blocked (private mode): the lesson still works, it just can't resume.
  }
}

export function clearLessonProgress(userId: number, lessonId: number) {
  try {
    window.localStorage.removeItem(keyFor(userId, lessonId));
  } catch {
    // Ignore: see writeLessonProgress.
  }
}
