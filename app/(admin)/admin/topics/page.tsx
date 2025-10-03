import { getTopics } from '@/actions/topic';
import { TypographyH3 } from '@/components/typography';
import { columns } from './columns';
import { DataTable } from './data-table';

export default async function TopicsPage() {
  const topics = await getTopics();

  return (
    <div className='container mx-auto space-y-4 py-10'>
      <TypographyH3>Danh sách Units</TypographyH3>
      <DataTable columns={columns} data={topics} />
    </div>
  );
}
