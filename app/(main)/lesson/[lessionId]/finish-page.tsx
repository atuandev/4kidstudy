import ReactConfetti from "react-confetti";
import { Footer } from "./_components/footer";
import { ResultCard } from "./_components/result-card";
import Image from "next/image";
import { useWindowSize } from "react-use";
import { useRouter } from "next/navigation";
import { Exercise } from "@/types";

type FinishPageProps = {
  lessonId: number;
  exercises: Exercise[];
};

export default function FinishPage({ lessonId, exercises }: FinishPageProps) {
  const { width, height } = useWindowSize();
  const router = useRouter();

  return (
    <>
      <ReactConfetti
        recycle={false}
        numberOfPieces={500}
        tweenDuration={10_000}
        width={width}
        height={height}
      />
      <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-y-4 text-center lg:gap-y-8">
        <Image
          src="/finish.svg"
          alt="Finish"
          className="hidden lg:block"
          height={100}
          width={100}
        />

        <Image
          src="/finish.svg"
          alt="Finish"
          className="block lg:hidden"
          height={100}
          width={100}
        />

        <h1 className="text-lg font-bold text-neutral-700 lg:text-3xl">
          Great job! <br /> You&apos;ve completed the lesson.
        </h1>

        <div className="flex w-full items-center gap-x-4">
          <ResultCard variant="points" value={exercises.length * 10} />
        </div>
      </div>
      <Footer
        lessonId={lessonId}
        status="completed"
        onCheck={() => router.push("/practice")}
      />
      ;
    </>
  );
}
