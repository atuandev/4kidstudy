import { getExerciseByLessonId } from "@/actions/exercise";
import { getLesson } from "@/actions/lesson";
import { Quiz } from "./_components/quiz";
import { getProfile } from "@/actions/user/profile";

type LessonIdPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

export default async function LessonIdPage({ params }: LessonIdPageProps) {
  const { lessonId } = await params;
  const lessonIdNumber = parseInt(lessonId, 10);

  const [lessonExercises, lesson, profile] = await Promise.all([
    getExerciseByLessonId(lessonIdNumber),
    getLesson(lessonIdNumber),
    getProfile(),
  ]);

  return (
    <Quiz
      lesson={lesson}
      lessonExercises={lessonExercises}
      profile={profile}
    />
  );
}
