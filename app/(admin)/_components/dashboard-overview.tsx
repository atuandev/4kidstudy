import { getExercises } from '@/actions/exercise';
import { getFlashcards } from '@/actions/flashcard';
import { getLessons } from '@/actions/lesson';
import { getSentenceImages } from '@/actions/sentence';
import { getTopics } from '@/actions/topic';
import { getUsers } from '@/actions/user/user';
import { DashboardStats } from './dashboard-stats';
import { ExerciseTypeChart } from './exercise-type-chart';
import { LessonStatusChart } from './lesson-status-chart';
import { TopicDistributionChart } from './topic-distribution-chart';

export async function DashboardOverview() {
  const [lessons, exercises, topics, users, flashcards, sentenceImages] =
    await Promise.all([
      getLessons(),
      getExercises(),
      getTopics(),
      getUsers(),
      getFlashcards(),
      getSentenceImages(),
    ]);

  const lessonStatusData = [
    {
      status: 'PUBLISHED',
      count: lessons.filter((l) => l.status === 'PUBLISHED').length,
    },
    {
      status: 'DRAFT',
      count: lessons.filter((l) => l.status === 'DRAFT').length,
    },
    {
      status: 'ARCHIVED',
      count: lessons.filter((l) => l.status === 'ARCHIVED').length,
    },
  ];

  const exerciseTypeData = [
    {
      type: 'SELECT_IMAGE',
      count: exercises.filter((e) => e.type === 'SELECT_IMAGE').length,
    },
    {
      type: 'MULTIPLE_CHOICE',
      count: exercises.filter((e) => e.type === 'MULTIPLE_CHOICE').length,
    },
    {
      type: 'MATCHING',
      count: exercises.filter((e) => e.type === 'MATCHING').length,
    },
    {
      type: 'LISTENING',
      count: exercises.filter((e) => e.type === 'LISTENING').length,
    },
    {
      type: 'PRONUNCIATION',
      count: exercises.filter((e) => e.type === 'PRONUNCIATION').length,
    },
  ].filter((item) => item.count > 0);

  const topicDistributionData = topics
    .map((topic) => ({
      name: topic.title,
      lessonCount: lessons.filter((l) => l.topicId === topic.id).length,
    }))
    .filter((item) => item.lessonCount > 0)
    .sort((a, b) => b.lessonCount - a.lessonCount)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <DashboardStats
        totalLessons={lessons.length}
        totalExercises={exercises.length}
        totalTopics={topics.length}
        totalUsers={users.length}
        totalFlashcards={flashcards.length}
        totalSentenceImages={sentenceImages.length}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <LessonStatusChart data={lessonStatusData} />
        <ExerciseTypeChart data={exerciseTypeData} />
      </div>

      <TopicDistributionChart data={topicDistributionData} />
    </div>
  );
}

