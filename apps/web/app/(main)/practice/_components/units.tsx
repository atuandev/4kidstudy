import { Unit } from './unit';
import { TopicWithProgress } from '@/types/topic-with-progress';
import { PracticeStatistics } from '@/types';
import { FeedWrapper } from '@/components/feed-wrapper';
import { StickyWrapper } from '@/components/sticky-wrapper';
import { AttemptStatistics } from './attempt-statistics';

interface UnitsProps {
  readonly stats: PracticeStatistics;
  readonly topics: TopicWithProgress[];
}

const renderEmptyTopics = () => (
  <div className='rounded-lg border border-dashed p-8 text-center'>
    <p className='text-muted-foreground'>Select a grade to review practice content.</p>
  </div>
);

export default function Units({ stats, topics }: UnitsProps) {
  return (
    <div className='flex flex-row-reverse gap-[48px] px-6'>
      <StickyWrapper>
        <AttemptStatistics stats={stats} />
      </StickyWrapper>
      <FeedWrapper>
        {topics.length === 0 ? (
          renderEmptyTopics()
        ) : (
          topics.map((topic) => (
            <div key={topic.id} className='mb-4'>
              <Unit topic={topic} lessons={topic.lessons} />
            </div>
          ))
        )}
      </FeedWrapper>
    </div>
  );
}
