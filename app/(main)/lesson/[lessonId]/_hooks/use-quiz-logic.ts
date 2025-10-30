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
    phase,
    attemptId,
    nextExercise,
    selectOption,
    clearSelection,
    setStatus,
    getCurrentExercise,
    getOptions,
    addWrongExercise,
  } = useQuizStore();

  const { completeExercise, skipExercise, startExercise, currentExerciseStartTime } = useExerciseStatsStore();

  const exercise = getCurrentExercise();
  const options = getOptions();

  const handleSelect = (id: number) => {
    if (status !== 'none') return;

    // Handle wrong match signal from MATCHING exercise
    if (id === -1) {
      startTransition(() => {
        playIncorrect();
        setStatus('wrong');
        
        if (exercise && attemptId) {
          completeExercise(false, exercise.points);
          
          // Add to wrong list if in normal phase
          if (phase === 'normal') {
            addWrongExercise(exercise);
          }
          
          // Submit to backend
          const timeSec = currentExerciseStartTime 
            ? Math.floor((Date.now() - currentExerciseStartTime) / 1000)
            : 0;
          
          void submitExercise(attemptId, {
            exerciseId: exercise.id,
            isCorrect: false,
            selectedOptionId: undefined,
            timeSec,
            points: 0, // Wrong answer = 0 points
          });
        }
      });
      return;
    }

    selectOption(id);

    // Auto-complete MATCHING exercise when option is selected
    // This happens when all pairs are matched
    if (exercise?.type === 'MATCHING' && id > 0 && attemptId) {
      startTransition(() => {
        playCorrect();
        setStatus('correct');
        completeExercise(true, exercise.points);
        
        // Submit to backend
        const timeSec = currentExerciseStartTime 
          ? Math.floor((Date.now() - currentExerciseStartTime) / 1000)
          : 0;
        
        // Normal phase: 10 points, Review phase: 5 points
        const pointsToAward = phase === 'review' ? 5 : 10;
        
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

    // Add to wrong list if not in review phase and is reviewable type
    if (exercise && phase === 'normal') {
      const isReviewableType = ['SELECT_IMAGE', 'MULTIPLE_CHOICE', 'LISTENING', 'MATCHING'].includes(exercise.type);
      if (isReviewableType) {
        addWrongExercise(exercise);
      }
    }

    // Submit skip to backend (0 points)
    if (exercise && attemptId) {
      const timeSec = currentExerciseStartTime 
        ? Math.floor((Date.now() - currentExerciseStartTime) / 1000)
        : 0;
      
      void submitExercise(attemptId, {
        exerciseId: exercise.id,
        isCorrect: false,
        timeSec,
        points: 0, // Skip = 0 points
      });
    }

    skipExercise();
    nextExercise();
  };

  const handleContinue = () => {
    if (status === 'wrong') {
      // For auto-skip exercises (SELECT_IMAGE, MULTIPLE_CHOICE, LISTENING, MATCHING), 
      // skip to next exercise instead of retrying
      const isAutoSkipType = exercise && ['SELECT_IMAGE', 'MULTIPLE_CHOICE', 'LISTENING', 'MATCHING'].includes(exercise.type);
      
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

    if (!exercise || !attemptId) return;

    // Handle PRONUNCIATION exercise
    if (
      exercise.type === 'PRONUNCIATION' &&
      pronunciation.state === 'completed' &&
      pronunciation.score
    ) {
      const isGoodScore = pronunciation.score.overall >= 70;
      
      startTransition(() => {
        const timeSec = currentExerciseStartTime 
          ? Math.floor((Date.now() - currentExerciseStartTime) / 1000)
          : 0;
        
        // Normal phase: 10 points, Review phase: 5 points
        const pointsToAward = isGoodScore ? (phase === 'review' ? 5 : 10) : 0;
        
        if (isGoodScore) {
          playCorrect();
          setStatus('correct');
          completeExercise(true, exercise.points);
        } else {
          playIncorrect();
          setStatus('wrong');
          completeExercise(false, exercise.points);
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

    startTransition(() => {
      const timeSec = currentExerciseStartTime 
        ? Math.floor((Date.now() - currentExerciseStartTime) / 1000)
        : 0;
      
      // Normal phase: 10 points, Review phase: 5 points
      const pointsToAward = isCorrect ? (phase === 'review' ? 5 : 10) : 0;
      
      if (isCorrect) {
        playCorrect();
        setStatus('correct');
        completeExercise(true, exercise.points);
      } else {
        playIncorrect();
        setStatus('wrong');
        completeExercise(false, exercise.points);
        
        // Add to wrong list if in normal phase and is reviewable type
        const isReviewableType = ['SELECT_IMAGE', 'MULTIPLE_CHOICE', 'LISTENING', 'MATCHING'].includes(exercise.type);
        if (phase === 'normal' && isReviewableType) {
          addWrongExercise(exercise);
        }
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
    phase,
    pending,
    isDisabled,
    handleSelect,
    handleSkip,
    handleContinue,
  };
}

