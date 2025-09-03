import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreatePlaylistDto {
  @ApiProperty({ description: '플레이리스트 이름', example: '내가 좋아하는 ASMR' })
  @IsString()
  name: string;

  @ApiProperty({
    description: '플레이리스트 이미지 URL',
    example: 'https://example.com/playlist/123.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  imgUrl?: string;

  @ApiProperty({
    description: '플레이리스트 상태',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'DELETED'])
  status?: 'ACTIVE' | 'INACTIVE' | 'DELETED';
}
