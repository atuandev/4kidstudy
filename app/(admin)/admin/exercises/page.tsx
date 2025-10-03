import { getExercises } from '@/actions/exercise';
import { TypographyH3 } from '@/components/typography';
import { columns } from './columns';
import { DataTable } from './data-table';

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return (
    <div className='container mx-auto space-y-4 py-10'>
      <TypographyH3>Danh sách bài luyện tập</TypographyH3>
      <DataTable columns={columns} data={exercises} />
    </div>
  );
}
