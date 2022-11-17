import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateNoticeCommentRequest {
  @IsString()
  @IsNotEmpty()
  readonly comment: string;

  @IsNumber()
  @IsOptional()
  readonly parentId: number | null;
}
