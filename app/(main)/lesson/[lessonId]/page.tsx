import { getExerciseByLessonId } from "@/actions/exercise";
import { Quiz } from "./_components/quiz";

type LessonIdPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

export default async function LessonIdPage({ params }: LessonIdPageProps) {
  const { lessonId } = await params;
  const lessonIdNumber = parseInt(lessonId, 10);
  
  const lessonData = await getExerciseByLessonId(lessonIdNumber);

  return (
    <Quiz
      initialLessonId={lessonIdNumber}
      initialLessonExercises={lessonData}
      initialPercentage={0}
    />
  );
}
