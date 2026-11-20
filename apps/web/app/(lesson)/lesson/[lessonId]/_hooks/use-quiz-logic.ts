import { useTransition } from "react";
import { useQuizStore } from "@/lib/stores/quiz-store";
import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";

type UseQuizLogicProps = {
  playCorrect: () => void;
  playIncorrect: () => void;
};

/** First try: 10 points. Second try: 5 points. */
const pointsForTry = (attemptCount: number) => (attemptCount === 0 ? 10 : 5);

/**
 * Checks answers and moves through the lesson. Results stay in the quiz store
 * (`recordAnswer`); the finish page saves them all at once.
 */
export function useQuizLogic({ playCorrect, playIncorrect }: UseQuizLogicProps) {
  const [pending, startTransition] = useTransition();

  const {
    selectedOption,
    selectedOption2,
    status,
    pronunciation,
    activeIndex,
    exercises,
    nextExercise,
    selectOption,
    clearSelection,
    setStatus,
    getCurrentExercise,
    getOptions,
    getExerciseAttemptCount,
    incrementExerciseAttempt,
    resetPronunciation,
    recordAnswer,
  } = useQuizStore();

  const { completeExercise, skipExercise, startExercise, incrementWrongCount } =
    useExerciseStatsStore();

  const exercise = getCurrentExercise();
  const options = getOptions();

  /** Seconds spent on the current try. Read before completeExercise clears the clock. */
  const elapsedSec = () => {
    const start = useExerciseStatsStore.getState().currentExerciseStartTime;
    return start ? Math.floor((Date.now() - start) / 1000) : 0;
  };

  const markResult = (isCorrect: boolean, points: number) => {
    if (isCorrect) {
      playCorrect();
      setStatus("correct");
      completeExercise(true, points);
    } else {
      playIncorrect();
      setStatus("wrong");
      completeExercise(false, 0);
    }
  };

  const handleSelect = (id: number) => {
    if (status !== "none" || !exercise) return;

    // Wrong match signal from the MATCHING exercise
    if (id === -1) {
      incrementExerciseAttempt(exercise.id);
      const timeSec = elapsedSec();

      startTransition(() => {
        markResult(false, 0);
        recordAnswer({ exerciseId: exercise.id, isCorrect: false, timeSec, points: 0 });
      });
      return;
    }

    // MATCHING sets both options via selectOptions in the component;
    // selectOption would reset selectedOption2.
    if (exercise.type !== "MATCHING") {
      selectOption(id);
      return;
    }

    // MATCHING completes itself once every pair is matched.
    if (id > 0) {
      const pointsToAward = pointsForTry(getExerciseAttemptCount(exercise.id));
      incrementExerciseAttempt(exercise.id);
      const timeSec = elapsedSec();

      startTransition(() => {
        markResult(true, pointsToAward);
        recordAnswer({
          exerciseId: exercise.id,
          isCorrect: true,
          selectedOptionId: id,
          // Read at submit time so the last matched pair is included.
          selectedOption2Id: useQuizStore.getState().selectedOption2,
          timeSec,
          points: pointsToAward,
        });
      });
    }
  };

  const handleSkip = () => {
    if (status !== "none") return;

    if (exercise) {
      recordAnswer({
        exerciseId: exercise.id,
        isCorrect: false,
        isSkipped: true,
        timeSec: elapsedSec(),
        points: 0,
      });
    }

    skipExercise();
    nextExercise();
  };

  const handleContinue = () => {
    if (status === "wrong") {
      if (!exercise) return;

      // Two tries used: count it wrong and move on.
      if (getExerciseAttemptCount(exercise.id) >= 2) {
        incrementWrongCount();
        nextExercise();
        return;
      }

      // Otherwise allow a retry, timing it from now.
      clearSelection();
      resetPronunciation();
      startExercise();
      return;
    }

    if (status === "correct") {
      nextExercise();
      return;
    }

    if (!exercise) return;

    if (exercise.type === "PRONUNCIATION") {
      if (pronunciation.state !== "completed" || !pronunciation.score) return;

      const score = pronunciation.score;
      const overallScore = score.overall ?? 0;

      // overall >= 80: 10 points; 50 < overall < 80: 5 points; otherwise wrong.
      const pointsToAward = overallScore >= 80 ? 10 : overallScore > 50 ? 5 : 0;
      const isGoodScore = pointsToAward > 0;

      incrementExerciseAttempt(exercise.id);
      const timeSec = elapsedSec();

      startTransition(() => {
        markResult(isGoodScore, pointsToAward);
        recordAnswer({
          exerciseId: exercise.id,
          isCorrect: isGoodScore,
          timeSec,
          points: pointsToAward,
          pronunciation: {
            accuracy: score.accuracy,
            fluency: score.fluency,
            completeness: score.completeness,
            prosody: score.prosody,
            overall: score.overall,
          },
        });
      });
      return;
    }

    // MATCHING is completed in handleSelect.
    // Standard exercises: MULTIPLE_CHOICE, SELECT_IMAGE, LISTENING
    if (!selectedOption) return;

    const correctOption = options.find((option) => option.isCorrect);
    if (!correctOption) return;

    const isCorrect = correctOption.id === selectedOption;
    const pointsToAward = isCorrect ? pointsForTry(getExerciseAttemptCount(exercise.id)) : 0;

    incrementExerciseAttempt(exercise.id);
    const timeSec = elapsedSec();

    startTransition(() => {
      markResult(isCorrect, pointsToAward);
      recordAnswer({
        exerciseId: exercise.id,
        isCorrect,
        selectedOptionId: selectedOption,
        // On a retry the store keeps the first wrong choice here.
        selectedOption2Id: exercise.type === "MATCHING" ? selectedOption2 : undefined,
        timeSec,
        points: pointsToAward,
      });
    });
  };

  const isDisabled =
    pending ||
    // For MATCHING: disable until all matches complete (status becomes 'correct')
    (exercise?.type === "MATCHING" && status === "none") ||
    // For other exercises: disable if no option selected
    (!selectedOption && exercise?.type !== "MATCHING" && exercise?.type !== "PRONUNCIATION") ||
    // For PRONUNCIATION: disable until completed
    (exercise?.type === "PRONUNCIATION" && pronunciation.state !== "completed");

  return {
    exercise,
    options,
    selectedOption,
    status,
    pronunciation,
    activeIndex,
    exercises,
    pending,
    isDisabled,
    handleSelect,
    handleSkip,
    handleContinue,
  };
}
