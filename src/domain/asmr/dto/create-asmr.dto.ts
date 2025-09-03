import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateAsmrDto {
  @ApiProperty({ description: '플레이리스트 ID', example: 1 })
  @IsNumber()
  playlistId: number;

  @ApiProperty({ description: 'ASMR 이름', example: '빗소리 ASMR' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'ASMR 이미지 URL',
    example: 'https://example.com/images/asmr-image.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    description: 'YouTube URL',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    required: false
  })
  @IsOptional()
  @IsString()
  youtubeUrl?: string;

  @ApiProperty({
    description: '음악 파일 URL',
    example: 'https://example.com/music/rain-sound.mp3',
    required: false
  })
  @IsOptional()
  @IsString()
  musicUrl?: string;
}
