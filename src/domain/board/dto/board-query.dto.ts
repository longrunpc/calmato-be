import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FreeBoardQueryDto {
  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    description: '카테고리 필터',
    example: 'REVIEW',
    enum: ['REVIEW', 'QUESTION', 'DAILY', 'TIP'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['REVIEW', 'QUESTION', 'DAILY', 'TIP'])
  category?: 'REVIEW' | 'QUESTION' | 'DAILY' | 'TIP';

  @ApiProperty({
    description: '검색 키워드',
    example: '빗소리',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: '정렬 기준',
    example: 'latest',
    enum: ['latest', 'popular', 'views'],
    required: false,
    default: 'latest',
  })
  @IsOptional()
  @IsEnum(['latest', 'popular', 'views'])
  sort?: 'latest' | 'popular' | 'views' = 'latest';

  @ApiProperty({
    description: '연관된 ASMR ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  asmrId?: number;

  @ApiProperty({
    description: '연관된 플레이리스트 ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  playlistId?: number;
}

export class RequestBoardQueryDto {
  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    description: '신청 상태 필터',
    example: 'PENDING',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'])
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

  @ApiProperty({
    description: '신청 타입 필터',
    example: 'ASMR',
    enum: ['ASMR', 'MUSIC'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['ASMR', 'MUSIC'])
  requestType?: 'ASMR' | 'MUSIC';

  @ApiProperty({
    description: '검색 키워드',
    example: '빗소리',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: '정렬 기준',
    example: 'latest',
    enum: ['latest', 'popular', 'status'],
    required: false,
    default: 'latest',
  })
  @IsOptional()
  @IsEnum(['latest', 'popular', 'status'])
  sort?: 'latest' | 'popular' | 'status' = 'latest';
}
