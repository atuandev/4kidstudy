import { useTransition } from "react";
import { useQuizStore } from "@/lib/stores/quiz-store";
import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";

type UseQuizLogicProps = {
  playCorrect: () => void;
  playIncorrect: () => void;
};

const pointsForTry = (attemptCount: number) => (attemptCount === 0 ? 10 : 5);

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

    if (id === -1) {
      incrementExerciseAttempt(exercise.id);
      const timeSec = elapsedSec();

      startTransition(() => {
        markResult(false, 0);
        recordAnswer({ exerciseId: exercise.id, isCorrect: false, timeSec, points: 0 });
      });
      return;
    }

    if (exercise.type !== "MATCHING") {
      selectOption(id);
      return;
    }

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

      if (getExerciseAttemptCount(exercise.id) >= 2) {
        incrementWrongCount();
        nextExercise();
        return;
      }

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
        selectedOption2Id: exercise.type === "MATCHING" ? selectedOption2 : undefined,
        timeSec,
        points: pointsToAward,
      });
    });
  };

  const isDisabled =
    pending ||
    (exercise?.type === "MATCHING" && status === "none") ||
    (!selectedOption && exercise?.type !== "MATCHING" && exercise?.type !== "PRONUNCIATION") ||
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
