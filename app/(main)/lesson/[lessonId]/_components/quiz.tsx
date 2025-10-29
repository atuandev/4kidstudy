"use client";

import { Exercise } from "./exercise";
import { Footer } from "./footer";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import AudioPlayer from "./audio-player";
import FinishPage from "../finish-page";
import { ReviewMistakes } from "./review-mistakes";
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
  const {
    correctAudio,
    incorrectAudio,
    finishAudio,
    playCorrect,
    playIncorrect,
  } = useQuizAudio();

  // Session management
  const { isInitializing } = useQuizSession({
    lessonId: lesson.id,
    exercises: lessonExercises,
  });

  // Duration hook reads from store directly for reactivity
  const currentDuration = useQuizDuration();

  // Quiz logic - pass audio play functions
  const {
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
  } = useQuizLogic({ playCorrect, playIncorrect });

  // Stats
  const { totalPoints, correctCount, skippedCount, setReviewMode } =
    useExerciseStatsStore();
  const {
    updatePronunciation,
    shouldShowReview,
    startReviewPhase,
    wrongExercises,
    setPhase,
  } = useQuizStore();

  const handlePronunciationStateChange = (state: string, score?: any) => {
    updatePronunciation(state, score);
  };

  const handleStartReview = () => {
    setPhase("review");
    setReviewMode(true);
    startReviewPhase();
  };

  // Quiz complete logic
  if (!exercise) {
    // If normal phase is complete and there are wrong exercises, show review transition
    if (shouldShowReview() && phase === "normal") {
      return (
        <>
          {incorrectAudio}
          {finishAudio}
          {correctAudio}
          <ReviewMistakes
            wrongCount={wrongExercises.length}
            onStartReview={handleStartReview}
          />
        </>
      );
    }

    // Otherwise show finish page (either no wrong exercises or review phase is complete)
    return (
      <>
        {incorrectAudio}
        {finishAudio}
        {correctAudio}
        <FinishPage lessonId={lesson.id} />
      </>
    );
  }

  const title =
    phase === "review"
      ? `Ôn luyện - ${EXERCISE_TITLES[exercise.type] || "Exercise"}`
      : EXERCISE_TITLES[exercise.type] || "Exercise";

  return (
    <>
      {incorrectAudio}
      {correctAudio}
      {finishAudio}

      <Header
        currentExercise={activeIndex + 1}
        totalExercises={exercises.length}
        correctCount={correctCount}
        skipCount={skippedCount}
        totalPoints={totalPoints}
        duration={currentDuration}
        unitTitle={phase === "review" ? "Ôn luyện" : lesson.topic.title}
        lessonTitle={phase === "review" ? "Sửa lỗi sai" : lesson.title}
      />

      <div className="h-[calc(100vh-260px)]">
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
        isAutoSkipExercise={[
          "SELECT_IMAGE",
          "MULTIPLE_CHOICE",
          "LISTENING",
        ].includes(exercise.type)}
        hintVi={exercise.hintVi}
        hintEn={exercise.hintEn}
      />
    </>
  );
};
