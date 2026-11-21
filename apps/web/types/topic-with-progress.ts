import { Topic } from "./topic";
import { TopicProgress } from "./learning-progress";

export interface TopicWithProgress extends Topic {
  readonly progress: TopicProgress;
}
