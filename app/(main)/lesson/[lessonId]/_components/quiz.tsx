"use client";

import { Exercise } from "./exercise";
import { Footer } from "./footer";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import AudioPlayer from "./audio-player";
import FinishPage from "../finish-page";
import {
  useQuizAudio,
  useQuizLogic,
  useQuizSession,
  useQuizDuration,
} from "../_hooks";
import { useQuizStore } from "@/lib/stores/quiz-store";
import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";
import { Exercise as ExerciseType, Lesson } from "@/types";

type QuizProps = {
  lesson: Lesson;
  lessonExercises: ExerciseType[];
};

const EXERCISE_TITLES = {
  SELECT_IMAGE: "Chọn ảnh đúng",
  MULTIPLE_CHOICE: "Chọn đáp án đúng",
  MATCHING: "Ghép cặp",
  LISTENING: "Nghe - chọn đáp án",
  PRONUNCIATION: "Luyện phát âm",
} as const;

export const Quiz = ({ lesson, lessonExercises }: QuizProps) => {
  // Audio hooks - must be called first to render audio elements
  const { correctAudio, incorrectAudio, finishAudio, playCorrect, playIncorrect } = useQuizAudio();

  // Session management
  const { startTime } = useQuizSession({
    lessonId: lesson.id,
    exercises: lessonExercises,
  });

  const currentDuration = useQuizDuration(startTime);

  // Quiz logic - pass audio play functions
  const {
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
  } = useQuizLogic({ playCorrect, playIncorrect });

  // Stats
  const { totalPoints, correctCount } = useExerciseStatsStore();
  const { updatePronunciation } = useQuizStore();

  const handlePronunciationStateChange = (state: string, score?: any) => {
    updatePronunciation(state, score);
  };

  // Quiz complete - show finish page
  if (!exercise) {
    return (
      <>
        {incorrectAudio}
        {finishAudio}
        {correctAudio}
        <FinishPage lessonId={lesson.id} />
      </>
    );
  }

  const title = EXERCISE_TITLES[exercise.type] || "Exercise";

  return (
    <>
      {incorrectAudio}
      {correctAudio}
      {finishAudio}

      <Header
        currentExercise={activeIndex + 1}
        totalExercises={exercises.length}
        correctCount={correctCount}
        totalPoints={totalPoints}
        duration={currentDuration}
        unitTitle={lesson.topic.title}
        lessonTitle={lesson.title}
      />

      <div className="h-[calc(100vh-240px)]">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-4 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <h1 className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-2xl">
              {title}
            </h1>

            <div>
              <QuestionBubble question={exercise.prompt} />

              {exercise.type === "SELECT_IMAGE" && exercise.audioUrl && (
                <div className="flex items-center justify-center mb-6">
                  <AudioPlayer
                    audioUrl={exercise.audioUrl}
                    variant="button"
                    className="text-center"
                  />
                </div>
              )}

              {exercise.type === "LISTENING" && exercise.audioUrl && (
                <div className="mb-4">
                  <AudioPlayer audioUrl={exercise.audioUrl} />
                </div>
              )}

              <Exercise
                options={options}
                onSelect={handleSelect}
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
        disabled={isDisabled}
        status={status}
        onCheck={handleContinue}
        onSkip={handleSkip}
        showSkip={status === "none"}
      />
    </>
  );
};
