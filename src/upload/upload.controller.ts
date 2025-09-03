import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';

import { S3Service } from '../common/services/s3.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../domain/user/entities/user.entity';

interface UploadedFileType {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
}

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('file')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '파일 업로드를 위한 multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '업로드할 파일 (이미지 파일)',
        },
        type: {
          type: 'string',
          enum: ['asmrImage', 'playlistImage', 'profileImage'],
          description:
            '파일 타입 (asmrImage: ASMR 이미지, playlistImage: 플레이리스트 썸네일, profileImage: 프로필 이미지)',
          example: 'asmrImage',
        },
      },
      required: ['file', 'type'],
    },
  })
  @ApiOperation({
    summary: '파일 업로드',
    description: `파일을 S3에 업로드합니다.

**지원하는 파일 타입:**
- \`asmrImage\`: ASMR 관련 이미지
- \`playlistImage\`: 플레이리스트 썸네일 이미지
- \`profileImage\`: 사용자 프로필 이미지

**업로드 경로:** \`{type}/{userId}/{uuid}.{extension}\``,
  })
  @ApiResponse({
    status: 200,
    description: '파일 업로드 성공',
    schema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'S3에 저장된 파일의 키',
          example: 'asmrImage/123/550e8400-e29b-41d4-a716-446655440000.jpg',
        },
        url: {
          type: 'string',
          description: '업로드된 파일의 공개 URL',
          example:
            'https://your-bucket.s3.ap-northeast-2.amazonaws.com/asmrImage/123/550e8400-e29b-41d4-a716-446655440000.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '파일이 필요합니다',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
  })
  async uploadFile(
    @CurrentUser() user: User,
    @Body('type') type: string,
    @UploadedFile() file: UploadedFileType,
  ) {
    if (!file) {
      throw new BadRequestException('파일이 필요합니다');
    }

    const fileExtension = file.originalname.split('.').pop();
    const key = `${type}/${user.id}/${uuidv4()}.${fileExtension}`;

    const result = await this.s3Service.uploadFile(file, key);
    return result;
  }
}
