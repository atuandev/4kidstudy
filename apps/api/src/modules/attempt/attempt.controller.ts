import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AttemptService } from './attempt.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateAttemptDto,
  CreateAttemptDetailDto,
  SubmitExerciseDto,
  CompleteAttemptDto,
  SubmitAttemptDto,
  GetAttemptsQueryDto,
  GetPracticeStatisticsQueryDto,
  GetDailyPracticeStatsQueryDto,
  DailyPracticeStatsResponseDto,
  AttemptResponseDto,
  PaginatedAttemptsResponseDto,
  AttemptDetailResponseDto,
  PracticeStatisticsResponseDto,
  MostWrongExerciseStatsDto,
} from './dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('attempts')
@UseGuards(JwtAuthGuard)
export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async startAttempt(
    @Request() req: any,
    @Body() createAttemptDto: CreateAttemptDto,
  ): Promise<AttemptResponseDto> {
    const userId = req.user.id;
    return this.attemptService.startAttempt(userId, createAttemptDto);
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async submitAttempt(
    @Request() req: any,
    @Body() submitAttemptDto: SubmitAttemptDto,
  ): Promise<AttemptResponseDto> {
    const userId = req.user.id;
    return this.attemptService.submitAttempt(userId, submitAttemptDto);
  }

  @Post('details')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async createAttemptDetail(
    @Body() createAttemptDetailDto: CreateAttemptDetailDto,
  ): Promise<AttemptDetailResponseDto> {
    return await this.attemptService.createAttemptDetail(
      createAttemptDetailDto,
    );
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async submitExercise(
    @Param('id', ParseIntPipe) attemptId: number,
    @Body() submitExerciseDto: SubmitExerciseDto,
  ): Promise<AttemptDetailResponseDto> {
    return this.attemptService.submitExercise(attemptId, submitExerciseDto);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async completeAttempt(
    @Param('id', ParseIntPipe) attemptId: number,
    @Body() completeAttemptDto: CompleteAttemptDto,
  ): Promise<AttemptResponseDto> {
    return this.attemptService.completeAttempt(attemptId, completeAttemptDto);
  }

  @Get()
  async getAttempts(
    @Query() query: GetAttemptsQueryDto,
  ): Promise<PaginatedAttemptsResponseDto> {
    return this.attemptService.getAttempts(query);
  }

  @Get('lesson/:lessonId/best')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getBestAttempt(
    @Request() req: any,
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ): Promise<AttemptResponseDto | null> {
    const userId = req.user.id;
    return this.attemptService.getBestAttempt(userId, lessonId);
  }

  @Get('lesson/:lessonId/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getUserLessonAttempts(
    @Request() req: any,
    @Param('lessonId', ParseIntPipe) lessonId: number,
  ): Promise<AttemptResponseDto[]> {
    const userId = req.user.id;
    return this.attemptService.getUserLessonAttempts(userId, lessonId);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getPracticeStatistics(
    @Request() req: any,
    @Query() query: GetPracticeStatisticsQueryDto,
  ): Promise<PracticeStatisticsResponseDto> {
    const userId = req.user.id;
    return this.attemptService.getPracticeStatistics(userId, query.grade);
  }

  @Get('statistics/daily')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getDailyPracticeStats(
    @Request() req: any,
    @Query() query: GetDailyPracticeStatsQueryDto,
  ): Promise<DailyPracticeStatsResponseDto> {
    const userId = req.user.id;
    return this.attemptService.getDailyPracticeStats(userId, query.days ?? 7);
  }

  @Get('statistics/most-wrong-exercises')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMostWrongExercisesByLesson(
    @Request() req: any,
    @Query('lessonId', ParseIntPipe) lessonId: number,
  ): Promise<MostWrongExerciseStatsDto[]> {
    const userId = req.user.id;
    return this.attemptService.getMostWrongExercisesByLesson(userId, lessonId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getAttemptById(
    @Param('id', ParseIntPipe) attemptId: number,
  ): Promise<AttemptResponseDto> {
    return this.attemptService.getAttemptById(attemptId);
  }
}
