import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    description: '수정할 댓글 내용',
    example: '수정된 댓글 내용입니다.',
  })
  @IsString()
  content: string;
}
