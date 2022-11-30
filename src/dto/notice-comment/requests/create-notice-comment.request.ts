import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateNoticeCommentRequest {
  @IsString()
  @IsNotEmpty()
  comment: string;

  @IsNumber()
  @IsOptional()
  parentCommentId: number | null;
}
