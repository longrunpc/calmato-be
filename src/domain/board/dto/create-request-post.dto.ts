import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsUrl } from 'class-validator';

export class CreateRequestPostDto {
  @ApiProperty({
    description: '제목',
    example: '빗소리 ASMR 제작 요청',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '내용',
    example: '잔잔한 빗소리 ASMR을 만들어주세요.',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: '신청 타입',
    example: 'ASMR',
    enum: ['ASMR', 'MUSIC'],
  })
  @IsEnum(['ASMR', 'MUSIC'])
  requestType: 'ASMR' | 'MUSIC';

  @ApiProperty({
    description: '상세 설명',
    example:
      '30분 정도 길이로, 천둥소리는 없이 부드러운 빗소리만 있었으면 좋겠어요.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '참고 유튜브 URL',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  youtubeUrl?: string;

  @ApiProperty({
    description: '첨부 이미지 URL 배열',
    example: [
      'https://example.com/reference1.jpg',
      'https://example.com/reference2.jpg',
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];
}
