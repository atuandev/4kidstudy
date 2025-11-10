import http from '@/lib/http';
import { GradeValue } from '@/types/grade';
import { TopicWithProgress } from '@/types/topic-with-progress';
import { Topic } from '@/types/topic';
import { TopicProgress } from '@/types/learning-progress';

interface TopicsWithProgressResponse {
  readonly topics: TopicWithProgress[];
}

const buildTopicsWithProgress = (
  topics: Topic[],
  progresses: TopicProgress[],
): TopicWithProgress[] => {
  const progressByTopicId = new Map<number, TopicProgress>();
  progresses.forEach((progress) => {
    progressByTopicId.set(progress.topicId, progress);
  });

  return topics
    .map((topic) => {
      const progress = progressByTopicId.get(topic.id);
      if (!progress) {
        return null;
      }
      return {
        ...topic,
        progress,
      };
    })
    .filter((topic): topic is TopicWithProgress => topic !== null);
};

const fetchTopicProgresses = async (topics: Topic[]): Promise<TopicProgress[]> => {
  const results = await Promise.all(
    topics.map(async (topic) => {
      const { payload } = await http.get<TopicProgress>(`/learning-progress/topic/${topic.id}`);
      return payload;
    }),
  );
  return results;
};

/**
 * Fetches topics for a grade along with the current user's progress.
 */
export async function getTopicsWithProgress(
  grade: GradeValue,
): Promise<TopicsWithProgressResponse> {
  const { payload } = await http.get<Topic[]>(`/topics?grade=${grade}`);
  if (!Array.isArray(payload) || payload.length === 0) {
    return { topics: [] };
  }

  const progresses = await fetchTopicProgresses(payload);
  const topics = buildTopicsWithProgress(payload, progresses);

  return { topics };
}

