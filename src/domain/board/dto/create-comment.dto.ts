import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '정말 좋은 글이네요! 저도 이런 ASMR 좋아해요.',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: '부모 댓글 ID (대댓글 작성시)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}
