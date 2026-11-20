"use client";

import { Headphones, ImageIcon, ListChecks, Mic, Puzzle } from "lucide-react";

import type { PronunciationScore } from "@/lib/stores/quiz-store";
import { Exercise } from "./exercise";
import { Footer } from "./footer";
import { Header } from "./header";
import { QuestionBubble } from "./question-bubble";
import AudioPlayer from "./audio-player";
import FinishPage from "../finish-page";
import { useQuizAudio, useQuizLogic, useQuizSession, useQuizDuration } from "../_hooks";
import { useQuizStore } from "@/lib/stores/quiz-store";
import { useExerciseStatsStore } from "@/lib/stores/exercise-stats-store";
import { Exercise as ExerciseType, Lesson, User } from "@/types";

type QuizProps = {
  lesson: Lesson;
  lessonExercises: ExerciseType[];
  profile: User;
};

/** Vietnamese name, English echo, and the exercise tile's sticker hue (same as the homepage). */
const EXERCISE_TITLES = {
  SELECT_IMAGE: { vi: "Chọn hình đúng", en: "Select the picture", icon: ImageIcon, color: "#1CB0F6", shade: "#0284C7" },
  MULTIPLE_CHOICE: { vi: "Chọn đáp án đúng", en: "Multiple choice", icon: ListChecks, color: "#A855F7", shade: "#7E22CE" },
  MATCHING: { vi: "Ghép cặp", en: "Matching", icon: Puzzle, color: "#FF9600", shade: "#C2410C" },
  LISTENING: { vi: "Nghe và chọn", en: "Listening", icon: Headphones, color: "#14B8A6", shade: "#0F766E" },
  PRONUNCIATION: { vi: "Luyện phát âm", en: "Pronunciation", icon: Mic, color: "#FF4B4B", shade: "#BE123C" },
} as const;

export const Quiz = ({ lesson, lessonExercises, profile }: QuizProps) => {
  // Audio hooks - must be called first to render audio elements
  const { correctAudio, incorrectAudio, finishAudio, playCorrect, playIncorrect } = useQuizAudio();

  // Session management
  useQuizSession({
    lessonId: lesson.id,
    exercises: lessonExercises,
  });

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
    pending,
    isDisabled,
    handleSelect,
    handleSkip,
    handleContinue,
  } = useQuizLogic({ playCorrect, playIncorrect });

  // Stats
  const { totalPoints, correctCount, skippedCount, wrongCount } = useExerciseStatsStore();
  const { updatePronunciation, getExerciseAttemptCount } = useQuizStore();

  const handlePronunciationStateChange = (state: string, score?: PronunciationScore | null) => {
    updatePronunciation(state, score);
  };

  // Quiz complete logic
  if (!exercise) {
    return (
      <>
        {incorrectAudio}
        {finishAudio}
        {correctAudio}
        <FinishPage lessonId={lesson.id} grade={lesson.topic.grade} />
      </>
    );
  }

  const title = EXERCISE_TITLES[exercise.type] ?? EXERCISE_TITLES.MULTIPLE_CHOICE;
  const TitleIcon = title.icon;
  const attemptCountForExercise = getExerciseAttemptCount(exercise.id);
  const shouldHideHintsOnFirstWrong = status === "wrong" && attemptCountForExercise === 1;
  const isFirstWrongAttempt = status === "wrong" && attemptCountForExercise === 1;

  return (
    <div className="flex min-h-dvh flex-col">
      {incorrectAudio}
      {correctAudio}
      {finishAudio}

      <Header
        currentExercise={activeIndex + 1}
        totalExercises={exercises.length}
        correctCount={correctCount}
        wrongCount={wrongCount}
        totalPoints={totalPoints}
        duration={currentDuration}
        unitTitle={lesson.topic.title}
        lessonTitle={lesson.title}
        profile={profile}
        grade={lesson.topic.grade}
      />

      <main className="flex flex-1 justify-center px-4 pb-10 pt-6 sm:pt-10">
        <div className="flex w-full max-w-[680px] flex-col gap-6">
          <div className="flex items-center gap-3">
            <span
              className="flex size-11 shrink-0 -rotate-3 items-center justify-center rounded-[14px] border-[3px] border-white text-white [&_svg]:size-5"
              style={{
                backgroundColor: title.color,
                boxShadow: `0 0 0 2px #E2E8F0, 0 8px 14px -6px ${title.shade}`,
              }}
              aria-hidden="true"
            >
              <TitleIcon />
            </span>
            <h1 className="text-xl font-black leading-tight text-ink sm:text-2xl">
              <span className="sr-only">Câu {activeIndex + 1}: </span>
              {title.vi}
              <span className="ml-2 text-base font-extrabold text-sky-ink">{title.en}</span>
            </h1>
          </div>

          <QuestionBubble question={exercise.prompt} />

          {exercise.type === "SELECT_IMAGE" && exercise.audioUrl && (
            <div className="flex justify-center">
              <AudioPlayer audioUrl={exercise.audioUrl} variant="button" />
            </div>
          )}

          {exercise.type === "LISTENING" && exercise.audioUrl && (
            <AudioPlayer audioUrl={exercise.audioUrl} />
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
      </main>

      <Footer
        disabled={isDisabled}
        status={status}
        onCheck={handleContinue}
        onSkip={handleSkip}
        showSkip={status === "none"}
        isAutoSkipExercise={["SELECT_IMAGE", "MULTIPLE_CHOICE", "LISTENING"].includes(
          exercise.type,
        )}
        isFirstWrongAttempt={isFirstWrongAttempt}
        hintVi={shouldHideHintsOnFirstWrong ? undefined : exercise.hintVi}
        hintEn={shouldHideHintsOnFirstWrong ? undefined : exercise.hintEn}
      />
    </div>
  );
};
