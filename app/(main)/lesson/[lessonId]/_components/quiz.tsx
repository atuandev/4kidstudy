"use client";

import { useState, useTransition } from "react";

import { useAudio } from "react-use";

import { Exercise } from "./exercise";
import { Footer } from "./footer";
import { Header } from "./header";
import { Exercise as ExerciseType } from "@/types";
import FinishPage from "../finish-page";

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
    autoPlay: true,
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

  const exercise = exercises[activeIndex];
  const options = exercise?.options ?? [];

  const onNext = () => {
    setActiveIndex((current) => current + 1);
  };

  const onSelect = (id: number) => {
    if (status !== "none") return;

    setSelectedOption(id);
  };

  const onContinue = () => {
    if (!selectedOption) return;

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

    const correctOption = options.find((option) => option.isCorrect);

    if (!correctOption) return;

    if (correctOption.id === selectedOption) {
      startTransition(() => {
        void correctControls.play();
        setStatus("correct");
        setPercentage((prev) => prev + 100 / exercises.length);
      });
    } else {
      startTransition(() => {
        void incorrectControls.play();
        setStatus("wrong");
      });
    }
  };

  if (!exercise) {
    return (
      <>
        {/* Audio elements must be rendered for useAudio hook to work */}
        {incorrectAudio}
        {finishAudio}
        {correctAudio}

        <FinishPage lessonId={lessonId} exercises={exercises} />
      </>
    );
  }

  const title = exercise.prompt;

  return (
    <>
      {/* Audio elements must be rendered for useAudio hook to work */}
      {incorrectAudio}
      {correctAudio}
      {finishAudio}

      <Header percentage={percentage} />

      <div className="h-[calc(100vh-300px)]">
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col gap-y-12 px-6 lg:min-h-[350px] lg:w-[600px] lg:px-0">
            <h1 className="text-center text-lg font-bold text-neutral-700 lg:text-start lg:text-3xl">
              {title}
            </h1>

            <div>
              {/* {challenge.type === "ASSIST" && (
                <QuestionBubble question={challenge.question} />
              )} */}

              <Exercise
                options={options}
                onSelect={onSelect}
                status={status}
                selectedOption={selectedOption}
                disabled={pending}
                type={exercise.type}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer
        disabled={pending || !selectedOption}
        status={status}
        onCheck={onContinue}
      />
    </>
  );
};
