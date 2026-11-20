export class TopicXPDataPointDto {
  topicId: number;
  topicTitle: string;
  xpEarned: number;
  /** XP in this topic summed over every active learner in the user's grade. */
  gradeXpEarned: number;
}

export class TopicXPStatsResponseDto {
  data: TopicXPDataPointDto[];
  totalXP: number;
}
