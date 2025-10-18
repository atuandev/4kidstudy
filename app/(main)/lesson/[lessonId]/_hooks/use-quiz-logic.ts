import { useTransition } from 'react';
import { useQuizStore } from '@/lib/stores/quiz-store';
import { useExerciseStatsStore } from '@/lib/stores/exercise-stats-store';

type UseQuizLogicProps = {
  playCorrect: () => void;
  playIncorrect: () => void;
};

export function useQuizLogic({ playCorrect, playIncorrect }: UseQuizLogicProps) {
  const [pending, startTransition] = useTransition();
  
  const {
    selectedOption,
    status,
    pronunciation,
    activeIndex,
    exercises,
    phase,
    nextExercise,
    selectOption,
    clearSelection,
    setStatus,
    getCurrentExercise,
    getOptions,
    addWrongExercise,
  } = useQuizStore();

  const { completeExercise, skipExercise } = useExerciseStatsStore();

  const exercise = getCurrentExercise();
  const options = getOptions();

  const handleSelect = (id: number) => {
    if (status !== 'none') return;

    // Handle wrong match signal from MATCHING exercise
    if (id === -1) {
      startTransition(() => {
        playIncorrect();
        setStatus('wrong');
        
        if (exercise) {
          completeExercise(false, exercise.points);
        }
      });
      return;
    }

    selectOption(id);

    // Auto-complete MATCHING exercise when option is selected
    // This happens when all pairs are matched
    if (exercise?.type === 'MATCHING' && id > 0) {
      startTransition(() => {
        playCorrect();
        setStatus('correct');
        completeExercise(true, exercise.points);
      });
    }
  };

  const handleSkip = () => {
    if (status !== 'none') return;

    // Add to wrong list if not in review phase and is reviewable type
    if (exercise && phase === 'normal') {
      const isReviewableType = ['SELECT_IMAGE', 'MULTIPLE_CHOICE', 'LISTENING'].includes(exercise.type);
      if (isReviewableType) {
        addWrongExercise(exercise);
      }
    }

    skipExercise();
    nextExercise();
  };

  const handleContinue = () => {
    if (status === 'wrong') {
      // For auto-skip exercises (SELECT_IMAGE, MULTIPLE_CHOICE, LISTENING), 
      // skip to next exercise instead of retrying
      const isAutoSkipType = exercise && ['SELECT_IMAGE', 'MULTIPLE_CHOICE', 'LISTENING'].includes(exercise.type);
      
      if (isAutoSkipType) {
        nextExercise();
        return;
      }
      
      // For other exercises, allow retry
      clearSelection();
      return;
    }

    if (status === 'correct') {
      nextExercise();
      return;
    }

    if (!exercise) return;

    // Handle PRONUNCIATION exercise
    if (
      exercise.type === 'PRONUNCIATION' &&
      pronunciation.state === 'completed' &&
      pronunciation.score
    ) {
      const isGoodScore = pronunciation.score.overall >= 70;
      
      startTransition(() => {
        if (isGoodScore) {
          playCorrect();
          setStatus('correct');
          completeExercise(true, exercise.points);
        } else {
          playIncorrect();
          setStatus('wrong');
          completeExercise(false, exercise.points);
        }
      });
      return;
    }

    // MATCHING exercise completion is now handled in handleSelect
    // When all pairs are matched, status is already 'correct'

    // Handle standard exercises (MULTIPLE_CHOICE, SELECT_IMAGE, LISTENING)
    if (!selectedOption) return;

    const correctOption = options.find((option) => option.isCorrect);
    if (!correctOption) return;

    const isCorrect = correctOption.id === selectedOption;

    startTransition(() => {
      if (isCorrect) {
        playCorrect();
        setStatus('correct');
        completeExercise(true, exercise.points);
      } else {
        playIncorrect();
        setStatus('wrong');
        completeExercise(false, exercise.points);
        
        // Add to wrong list if in normal phase and is reviewable type
        const isReviewableType = ['SELECT_IMAGE', 'MULTIPLE_CHOICE', 'LISTENING'].includes(exercise.type);
        if (phase === 'normal' && isReviewableType) {
          addWrongExercise(exercise);
        }
      }
    });
  };

  const isDisabled =
    pending ||
    // For MATCHING: disable until all matches complete (status becomes 'correct')
    (exercise?.type === 'MATCHING' && status === 'none') ||
    // For other exercises: disable if no option selected
    (!selectedOption &&
      exercise?.type !== 'MATCHING' &&
      exercise?.type !== 'PRONUNCIATION') ||
    // For PRONUNCIATION: disable until completed
    (exercise?.type === 'PRONUNCIATION' &&
      pronunciation.state !== 'completed');

  return {
    exercise,
    options,
    selectedOption,
    status,
    pronunciation,
    activeIndex,
    exercises,
    phase,
    pending,
    isDisabled,
    handleSelect,
    handleSkip,
    handleContinue,
  };
}

