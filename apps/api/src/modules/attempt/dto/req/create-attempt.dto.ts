import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateAttemptDto {
  @IsInt()
  @IsNotEmpty()
  lessonId: number;
}
