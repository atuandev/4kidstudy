import { getExercises } from "@/actions/exercise";
import { TypographyH3 } from "@/components/typography";

export default async function ExercisesPage() {
  const exercises = await getExercises();
  return (
    <div>
      <TypographyH3>Danh sách bài luyện tập</TypographyH3>
      <div>
        {exercises.map((exercise) => (
          <div key={exercise.id}>{exercise.prompt}</div>
        ))}
      </div>
    </div>
  );
}
