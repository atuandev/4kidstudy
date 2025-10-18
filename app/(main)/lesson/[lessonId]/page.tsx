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

  const [lessonExercises, lesson] = await Promise.all([
    getExerciseByLessonId(lessonIdNumber),
    getLesson(lessonIdNumber),
  ]);

  console.log(lessonExercises);
  console.log(lesson);

  return (
    <Quiz
      lesson={lesson}
      lessonExercises={lessonExercises}
    />
  );
}
