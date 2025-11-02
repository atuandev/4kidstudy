import { useTransition } from 'react';
import { useQuizStore } from '@/lib/stores/quiz-store';
import { useExerciseStatsStore } from '@/lib/stores/exercise-stats-store';
import { submitExercise } from '@/actions/attempt';

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
    attemptId,
    nextExercise,
    selectOption,
    clearSelection,
    setStatus,
    getCurrentExercise,
    getOptions,
    getExerciseAttemptCount,
    incrementExerciseAttempt,
    resetPronunciation,
  } = useQuizStore();

  const { completeExercise, skipExercise, startExercise, currentExerciseStartTime } = useExerciseStatsStore();

  const exercise = getCurrentExercise();
  const options = getOptions();

  const handleSelect = (id: number) => {
    if (status !== 'none') return;

    // Handle wrong match signal from MATCHING exercise
    if (id === -1) {
      if (!exercise || !attemptId) return;
      
      const attemptCount = getExerciseAttemptCount(exercise.id);
      incrementExerciseAttempt(exercise.id);
      
      startTransition(() => {
        playIncorrect();
        setStatus('wrong');
        completeExercise(false, 0);
        
        // Submit to backend
        const timeSec = currentExerciseStartTime 
          ? Math.floor((Date.now() - currentExerciseStartTime) / 1000)
          : 0;
        
        void submitExercise(attemptId, {
          exerciseId: exercise.id,
          isCorrect: false,
          selectedOptionId: undefined,
          timeSec,
          points: 0,
        });
      });
      return;
    }

    selectOption(id);

    // Auto-complete MATCHING exercise when option is selected
    // This happens when all pairs are matched
    if (exercise?.type === 'MATCHING' && id > 0 && attemptId) {
      const attemptCount = getExerciseAttemptCount(exercise.id);
      incrementExerciseAttempt(exercise.id);
      
      // First attempt: 10 points, Second attempt: 5 points
      const pointsToAward = attemptCount === 0 ? 10 : 5;
      
      startTransition(() => {
        playCorrect();
        setStatus('correct');
        completeExercise(true, pointsToAward);
        
        // Submit to backend
        const timeSec = currentExerciseStartTime 
          ? Math.floor((Date.now() - currentExerciseStartTime) / 1000)
          : 0;
        
        void submitExercise(attemptId, {
          exerciseId: exercise.id,
          isCorrect: true,
          selectedOptionId: id,
          timeSec,
          points: pointsToAward,
        });
      });
    }
  };

  const handleSkip = () => {
    if (status !== 'none') return;

    // Submit skip to backend (0 points)
    if (exercise && attemptId) {
      const timeSec = currentExerciseStartTime 
        ? Math.floor((Date.now() - currentExerciseStartTime) / 1000)
        : 0;
      
      void submitExercise(attemptId, {
        exerciseId: exercise.id,
        isCorrect: false,
        timeSec,
        points: 0,
      });
    }

    skipExercise();
    nextExercise();
  };

  const handleContinue = () => {
    if (status === 'wrong') {
      if (!exercise) return;
      
      const attemptCount = getExerciseAttemptCount(exercise.id);
      
      // If already attempted twice, move to next exercise
      if (attemptCount >= 2) {
        nextExercise();
        return;
      }
      
      // Otherwise, allow retry - reset selection and pronunciation state
      clearSelection();
      resetPronunciation();
      return;
    }

    if (status === 'correct') {
      nextExercise();
      return;
    }

    if (!exercise || !attemptId) return;

    // Handle PRONUNCIATION exercise
    if (
      exercise.type === 'PRONUNCIATION' &&
      pronunciation.state === 'completed' &&
      pronunciation.score
    ) {
      const isGoodScore = pronunciation.score.overall >= 70;
      
      // Get attempt count before incrementing for scoring
      const attemptCount = getExerciseAttemptCount(exercise.id);
      
      // Only increment if this is a new submission (status === 'none')
      if (status === 'none') {
        incrementExerciseAttempt(exercise.id);
      }
      
      // First attempt: 10 points, Second attempt: 5 points
      // attemptCount = 0 means first attempt (before increment), attemptCount = 1 means second attempt
      const pointsToAward = isGoodScore ? (attemptCount === 0 ? 10 : 5) : 0;
      
      startTransition(() => {
        const timeSec = currentExerciseStartTime 
          ? Math.floor((Date.now() - currentExerciseStartTime) / 1000)
          : 0;
        
        if (isGoodScore) {
          playCorrect();
          setStatus('correct');
          completeExercise(true, pointsToAward);
        } else {
          playIncorrect();
          setStatus('wrong');
          completeExercise(false, 0);
        }
        
        // Submit to backend with pronunciation data
        void submitExercise(attemptId, {
          exerciseId: exercise.id,
          isCorrect: isGoodScore,
          timeSec,
          points: pointsToAward,
          pronunciation: {
            accuracy: pronunciation.score.accuracy,
            fluency: pronunciation.score.fluency,
            completeness: pronunciation.score.completeness,
            prosody: pronunciation.score.prosody,
            overall: pronunciation.score.overall,
          },
        });
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
    const attemptCount = getExerciseAttemptCount(exercise.id);
    incrementExerciseAttempt(exercise.id);
    
    // First attempt: 10 points, Second attempt: 5 points
    const pointsToAward = isCorrect ? (attemptCount === 0 ? 10 : 5) : 0;

    startTransition(() => {
      const timeSec = currentExerciseStartTime 
        ? Math.floor((Date.now() - currentExerciseStartTime) / 1000)
        : 0;
      
      if (isCorrect) {
        playCorrect();
        setStatus('correct');
        completeExercise(true, pointsToAward);
      } else {
        playIncorrect();
        setStatus('wrong');
        completeExercise(false, 0);
      }
      
      // Submit to backend
      void submitExercise(attemptId, {
        exerciseId: exercise.id,
        isCorrect,
        selectedOptionId: selectedOption,
        timeSec,
        points: pointsToAward,
      });
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
    pending,
    isDisabled,
    handleSelect,
    handleSkip,
    handleContinue,
  };
}

