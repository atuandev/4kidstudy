import { Topic } from './topic';
import { TopicProgress } from './learning-progress';

/**
 * TopicWithProgress interface combines topic metadata with user progress.
 */
export interface TopicWithProgress extends Topic {
  readonly progress: TopicProgress;
}

