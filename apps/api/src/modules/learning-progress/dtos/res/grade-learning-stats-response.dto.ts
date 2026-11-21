import { ApiProperty } from '@nestjs/swagger';

export class GradeStatsItemDto {
  @ApiProperty({ example: 12 })
  id: number;

  @ApiProperty({
    description: 'Flashcard term or sentence text',
    example: 'apple',
  })
  name: string;

  @ApiProperty({ example: 3 })
  reviewCount: number;

  @ApiProperty({ example: 'Unit 1: Hello' })
  topicName: string;

  @ApiProperty({ example: 19 })
  topicId: number;
}

export class GradeContentStatsDto {
  @ApiProperty({ description: 'Mastered items in the grade', example: 15 })
  reviewed: number;

  @ApiProperty({ description: 'All items in the grade', example: 120 })
  total: number;

  @ApiProperty({ description: 'reviewed / total * 100', example: 12.5 })
  percentage: number;

  @ApiProperty({
    description: 'Five most-reviewed items',
    type: [GradeStatsItemDto],
  })
  topItems: GradeStatsItemDto[];

  @ApiProperty({
    description: 'Mastered items, most-reviewed first',
    type: [GradeStatsItemDto],
  })
  allItems: GradeStatsItemDto[];
}

export class GradeStatsTopicDto {
  @ApiProperty({ example: 19 })
  id: number;

  @ApiProperty({ example: 'Unit 1: Hello' })
  name: string;
}

export class GradeStatsTopTopicDto extends GradeStatsTopicDto {
  @ApiProperty({
    description: 'Progress rows the user has in the topic',
    example: 8,
  })
  reviewCount: number;
}

export class GradeLearningStatsResponseDto {
  @ApiProperty({
    description: 'Mastered flashcards plus mastered sentences',
    example: 23,
  })
  totalReviewed: number;

  @ApiProperty({ type: GradeContentStatsDto })
  flashcardStats: GradeContentStatsDto;

  @ApiProperty({ type: GradeContentStatsDto })
  sentenceStats: GradeContentStatsDto;

  @ApiProperty({
    description: 'Topics where every flashcard and sentence is mastered',
    example: 2,
  })
  topicCount: number;

  @ApiProperty({
    description: 'Five topics with the most progress rows',
    type: [GradeStatsTopTopicDto],
  })
  topTopics: GradeStatsTopTopicDto[];

  @ApiProperty({
    description: 'All topics in the grade, in display order',
    type: [GradeStatsTopicDto],
  })
  topics: GradeStatsTopicDto[];
}
