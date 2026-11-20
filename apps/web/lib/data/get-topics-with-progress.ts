import http from "@/lib/http";
import { GradeValue } from "@/types/grade";
import { TopicWithProgress } from "@/types/topic-with-progress";
import { Topic } from "@/types/topic";
import { TopicProgress } from "@/types/learning-progress";

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

/**
 * Fetches topics for a grade along with the current user's progress.
 */
export async function getTopicsWithProgress(
  grade: GradeValue,
): Promise<TopicsWithProgressResponse> {
  // Both requests are independent, so run them together: two round-trips
  // in parallel instead of one request per topic.
  const [{ payload: topics }, { payload: progresses }] = await Promise.all([
    http.get<Topic[]>(`/topics?grade=${grade}`),
    http.get<TopicProgress[]>(`/learning-progress/topics?grade=${grade}`),
  ]);
  if (!Array.isArray(topics) || topics.length === 0) {
    return { topics: [] };
  }

  return {
    topics: buildTopicsWithProgress(topics, Array.isArray(progresses) ? progresses : []),
  };
}
