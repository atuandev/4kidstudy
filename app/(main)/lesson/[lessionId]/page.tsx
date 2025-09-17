import { getExerciseByLessonId } from "@/actions/excercise";
import { Quiz } from "./_components/quiz";

type LessonIdPageProps = {
  params: {
    lessonId: number;
  };
};

export default async function LessonIdPage({ params }: LessonIdPageProps) {
  const lessonData = await getExerciseByLessonId(params.lessonId);

  return (
    <Quiz
      initialLessonId={params.lessonId}
      initialLessonExercises={lessonData}
      initialPercentage={0}
    />
  );
}
