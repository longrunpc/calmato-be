import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { CreateFreePostDto } from './create-free-post.dto';

export class UpdateFreePostDto extends PartialType(CreateFreePostDto) {}

export class UpdateRequestPostDto extends PartialType(CreateFreePostDto) {
  @ApiProperty({
    description: '신청 상태 (관리자만 수정 가능)',
    example: 'IN_PROGRESS',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'])
  requestStatus?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
}
