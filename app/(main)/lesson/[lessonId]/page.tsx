import { getExerciseByLessonId } from "@/actions/exercise";
import { getLesson } from "@/actions/lesson";
import { Quiz } from "./_components/quiz";

type LessonIdPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

export default async function LessonIdPage({ params }: LessonIdPageProps) {
  const { lessonId } = await params;
  const lessonIdNumber = parseInt(lessonId, 10);

  const [lessonData, lesson] = await Promise.all([
    getExerciseByLessonId(lessonIdNumber),
    getLesson(lessonIdNumber),
  ]);

  return (
    <Quiz
      initialLessonId={lessonIdNumber}
      initialLessonExercises={lessonData}
      unitTitle={lesson.topic.title}
      lessonIndex={lesson.order}
    />
  );
}
