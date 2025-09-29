"use client";

import { useState, useTransition, useEffect } from "react";

import { useAudio } from "react-use";

import { Exercise } from "./exercise";
import { Footer } from "./footer";
import { Header } from "./header";
import { Exercise as ExerciseType } from "@/types";
import FinishPage from "../finish-page";
import { QuestionBubble } from "./question-bubble";
import AudioPlayer from "./audio-player";
import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";

type QuizProps = {
  initialPercentage: number;
  initialLessonId: number;
  initialLessonExercises: ExerciseType[];
};

export const Quiz = ({
  initialPercentage,
  initialLessonId,
  initialLessonExercises,
}: QuizProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [correctAudio, _c, correctControls] = useAudio({ src: "/correct.wav" });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [incorrectAudio, _i, incorrectControls] = useAudio({
    src: "/incorrect.wav",
  });
  const [finishAudio] = useAudio({
    src: "/finish.mp3",
  });

  const [pending, startTransition] = useTransition();

  const [lessonId] = useState(initialLessonId);
  const [percentage, setPercentage] = useState(() => {
    return initialPercentage === 100 ? 0 : initialPercentage;
  });
  const [exercises] = useState(initialLessonExercises);
  const [activeIndex, setActiveIndex] = useState(0);

  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"none" | "wrong" | "correct">("none");
  
  // Pronunciation exercise state
  const [pronunciationState, setPronunciationState] = useState<string>("idle");
  const [pronunciationScore, setPronunciationScore] = useState<any>(null);

  // Exercise stats store
  const { 
    startSession, 
    endSession, 
    startExercise, 
    completeExercise, 
    skipExercise,
    totalPoints,
    correctCount,
    totalExercises: completedExercises,
    startTime
  } = useExerciseStatsStore();

  // Initialize session and start first exercise
  useEffect(() => {
    startSession();
    if (exercises.length > 0) {
      startExercise();
    }
    
    // Cleanup: end session when component unmounts
    return () => {
      endSession();
    };
  }, [startSession, endSession, startExercise, exercises.length]);

  // Start new exercise when activeIndex changes
  useEffect(() => {
    if (activeIndex > 0 && activeIndex < exercises.length) {
      startExercise();
    }
  }, [activeIndex, exercises.length, startExercise]);

  // End session when quiz is completed (when there's no current exercise)
  useEffect(() => {
    if (!exercises[activeIndex]) {
      endSession();
    }
  }, [activeIndex, exercises, endSession]);

  // Force re-render every second for realtime duration
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const exercise = exercises[activeIndex];
  const options = exercise?.options ?? [];

  // Calculate realtime duration
  const getCurrentDuration = () => {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  };

  const onNext = () => {
    setActiveIndex((current) => current + 1);
    
    // Reset pronunciation state for next exercise
    setPronunciationState("idle");
    setPronunciationScore(null);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;

    // Handle wrong match signal from MATCHING exercise
    if (id === -1) {
      startTransition(() => {
        void incorrectControls.play();
        setStatus("wrong");
        
        // Track exercise completion (incorrect, no points)
        completeExercise(false, exercise.points);
      });
      return;
    }

    setSelectedOption(id);
  };

  const onSkip = () => {
    if (status !== "none") return;

    // Track skip in stats
    skipExercise();

    // Update progress bar
    setPercentage((prev) => prev + 100 / exercises.length);

    // Move to next exercise
    onNext();
    setStatus("none");
    setSelectedOption(undefined);
  };

  const onContinue = () => {
    if (status === "wrong") {
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    if (status === "correct") {
      onNext();
      setStatus("none");
      setSelectedOption(undefined);
      return;
    }

    // Handle PRONUNCIATION exercise completion
    if (exercise.type === "PRONUNCIATION" && pronunciationState === "completed" && pronunciationScore) {
      const isGoodScore = pronunciationScore.overall >= 70;
      
      if (isGoodScore) {
        startTransition(() => {
          void correctControls.play();
          setStatus("correct");
          setPercentage((prev) => prev + 100 / exercises.length);
          
          // Track exercise completion
          completeExercise(true, exercise.points);
        });
      } else {
        startTransition(() => {
          void incorrectControls.play();
          setStatus("wrong");
          
          // Track exercise completion (incorrect, no points)
          completeExercise(false, exercise.points);
        });
      }
      return;
    }

    // Handle MATCHING exercise completion
    if (exercise.type === "MATCHING" && selectedOption) {
      startTransition(() => {
        void correctControls.play();
        setStatus("correct");
        setPercentage((prev) => prev + 100 / exercises.length);
        
        // Track exercise completion
        completeExercise(true, exercise.points);
      });
      return;
    }

    if (!selectedOption) return;

    const correctOption = options.find((option) => option.isCorrect);

    if (!correctOption) return;

    const isCorrect = correctOption.id === selectedOption;
    
    if (isCorrect) {
      startTransition(() => {
        void correctControls.play();
        setStatus("correct");
        setPercentage((prev) => prev + 100 / exercises.length);
        
        // Track exercise completion
        completeExercise(true, exercise.points);
      });
    } else {
      startTransition(() => {
        void incorrectControls.play();
        setStatus("wrong");
        
        // Track exercise completion (incorrect, no points)
        completeExercise(false, exercise.points);
      });
    }
  };

  // Handle pronunciation state changes
  const handlePronunciationStateChange = (state: string, score?: any) => {
    setPronunciationState(state);
    if (score) {
      setPronunciationScore(score);
    }
  };

  if (!exercise) {
    return (
      <>
        {/* Audio elements must be rendered for useAudio hook to work */}
        {incorrectAudio}
        {finishAudio}
        {correctAudio}

        <FinishPage lessonId={lessonId} />
      </>
    );
  }

  const title =
    (exercise.type === "SELECT_IMAGE" && "Chọn ảnh đúng") ||
    (exercise.type === "MULTIPLE_CHOICE" && "Chọn đáp án đúng") ||
    (exercise.type === "MATCHING" && "Ghép cặp") ||
    (exercise.type === "LISTENING" && "Nghe - chọn đáp án") ||
    (exercise.type === "PRONUNCIATION" && "Luyện phát âm");

  return (
    <>
      {/* Audio elements must be rendered for useAudio hook to work */}
      {incorrectAudio}
      {correctAudio}
      {finishAudio}

      <Header 
        currentExercise={activeIndex + 1}
        totalExercises={exercises.length}
        correctCount={correctCount}
        totalPoints={totalPoints}
        duration={getCurrentDuration()}
      />

      <div className="h-[calc(100vh-300px)]">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <h1 className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-2xl">
              {title}
            </h1>

            <div>
              <QuestionBubble question={exercise.prompt} />
              
              {/* Audio player for SELECT_IMAGE exercise with vocabulary */}
              {exercise.type === "SELECT_IMAGE" && exercise.audioUrl && (
                <div className="flex items-center justify-center mb-6">
                  <AudioPlayer 
                    audioUrl={exercise.audioUrl} 
                    variant="button"
                    className="text-center"
                  />
                </div>
              )}
              
              {/* Audio player for LISTENING exercise */}
              {exercise.type === "LISTENING" && exercise.audioUrl && (
                <div className="mb-4">
                  <AudioPlayer audioUrl={exercise.audioUrl} />
                </div>
              )}

              <Exercise
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
                type={exercise.type}
                targetText={exercise.targetText}
                audioUrl={exercise.audioUrl}
                imageUrl={exercise.imageUrl}
                prompt={exercise.prompt}
                onPronunciationStateChange={handlePronunciationStateChange}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer
        disabled={
          pending || 
          (!selectedOption && exercise.type !== "MATCHING" && exercise.type !== "PRONUNCIATION") ||
          (exercise.type === "PRONUNCIATION" && pronunciationState !== "completed")
        }
        status={status}
        onCheck={onContinue}
        onSkip={onSkip}
        showSkip={status === "none"}
      />
    </>
  );
};
