import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { LearningProgressService } from './learning-progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateLearningProgressDto,
  UpdateLearningProgressDto,
  GetLearningProgressQueryDto,
  ReviewContentDto,
  LearningProgressResponseDto,
  PaginatedLearningProgressResponseDto,
  LearningProgressStatsResponseDto,
  TopicProgressResponseDto,
  GetTopicsProgressQueryDto,
  GradeLearningStatsResponseDto,
} from './dtos';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Learning Progress')
@Controller('learning-progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LearningProgressController {
  constructor(
    private readonly learningProgressService: LearningProgressService,
  ) {}

  @Post()
  async getOrCreateProgress(
    @Request() req: any,
    @Body() createDto: CreateLearningProgressDto,
  ): Promise<LearningProgressResponseDto> {
    const userId = req.user.id;
    return this.learningProgressService.getOrCreateProgress(userId, createDto);
  }

  @Post('review')
  async reviewContent(
    @Request() req: any,
    @Body() reviewDto: ReviewContentDto,
  ): Promise<LearningProgressResponseDto> {
    const userId = req.user.id;
    return this.learningProgressService.reviewContent(userId, reviewDto);
  }

  @Get('stats')
  async getUserStats(
    @Request() req: any,
  ): Promise<LearningProgressStatsResponseDto> {
    const userId = req.user.id;
    return this.learningProgressService.getUserStats(userId);
  }

  @Get('topics')
  @ApiOkResponse({ type: TopicProgressResponseDto, isArray: true })
  async getTopicsProgress(
    @Request() req: any,
    @Query() query: GetTopicsProgressQueryDto,
  ): Promise<TopicProgressResponseDto[]> {
    const userId = req.user.id;
    return this.learningProgressService.getTopicsProgressByGrade(
      userId,
      query.grade,
    );
  }

  @Get('grade-stats')
  @ApiOkResponse({ type: GradeLearningStatsResponseDto })
  async getGradeLearningStats(
    @Request() req: any,
    @Query() query: GetTopicsProgressQueryDto,
  ): Promise<GradeLearningStatsResponseDto> {
    const userId = req.user.id;
    return this.learningProgressService.getGradeLearningStats(
      userId,
      query.grade,
    );
  }

  @Get('topic/:topicId')
  async getTopicProgress(
    @Request() req: any,
    @Param('topicId', ParseIntPipe) topicId: number,
  ): Promise<TopicProgressResponseDto> {
    const userId = req.user.id;
    return this.learningProgressService.getTopicProgress(userId, topicId);
  }

  @Get('topic/:topicId/reviewed-flashcards')
  async getReviewedFlashcards(
    @Request() req: any,
    @Param('topicId', ParseIntPipe) topicId: number,
  ): Promise<{ flashcardIds: number[] }> {
    const userId = req.user.id;
    const flashcardIds =
      await this.learningProgressService.getReviewedFlashcardIds(
        userId,
        topicId,
      );
    return { flashcardIds };
  }

  @Get('topic/:topicId/reviewed-sentences')
  async getReviewedSentences(
    @Request() req: any,
    @Param('topicId', ParseIntPipe) topicId: number,
  ): Promise<{ sentenceIds: number[] }> {
    const userId = req.user.id;
    const sentenceIds =
      await this.learningProgressService.getReviewedSentenceIds(
        userId,
        topicId,
      );
    return { sentenceIds };
  }

  @Get('last-topic')
  async getLastReviewedTopic(
    @Request() req: any,
  ): Promise<{ topicId: number | null }> {
    const userId = req.user.id;
    const topicId =
      await this.learningProgressService.getLastReviewedTopic(userId);
    return { topicId };
  }

  @Get()
  async getUserProgress(
    @Request() req: any,
    @Query() query: GetLearningProgressQueryDto,
  ): Promise<PaginatedLearningProgressResponseDto> {
    const userId = req.user.id;
    return this.learningProgressService.getUserProgress(userId, query);
  }

  @Get(':id')
  async getProgressById(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LearningProgressResponseDto> {
    const userId = req.user.id;
    return this.learningProgressService.getProgressById(id, userId);
  }

  @Patch(':id')
  async updateProgress(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateLearningProgressDto,
  ): Promise<LearningProgressResponseDto> {
    const userId = req.user.id;
    return this.learningProgressService.updateProgress(id, userId, updateDto);
  }

  @Delete(':id')
  async deleteProgress(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.learningProgressService.deleteProgress(id, userId);
    return { message: 'Learning progress deleted successfully' };
  }
}
