import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
} from 'class-validator';

export class CreateFreePostDto {
  @ApiProperty({
    description: '제목',
    example: '빗소리 ASMR 추천해요!',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '내용',
    example: '정말 좋은 ASMR입니다. 수면에 도움이 많이 되어요.',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: '카테고리',
    example: 'REVIEW',
    enum: ['REVIEW', 'QUESTION', 'DAILY', 'TIP'],
  })
  @IsEnum(['REVIEW', 'QUESTION', 'DAILY', 'TIP'])
  category: 'REVIEW' | 'QUESTION' | 'DAILY' | 'TIP';

  @ApiProperty({
    description: '첨부 이미지 URL 배열',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiProperty({
    description: '연관된 ASMR ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  asmrId?: number;

  @ApiProperty({
    description: '연관된 플레이리스트 ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  playlistId?: number;
}
