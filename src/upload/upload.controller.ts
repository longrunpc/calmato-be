import {
  BadRequestException,
  Body,
  Controller,
  Delete,
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
    summary: 'S3에 이미지 업로드',
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

  @Delete('file')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    description: '삭제할 파일의 URL',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'S3 파일의 전체 URL',
          example:
            'https://your-bucket.s3.ap-northeast-2.amazonaws.com/asmrImage/123/550e8400-e29b-41d4-a716-446655440000.jpg',
        },
      },
      required: ['url'],
    },
  })
  @ApiOperation({
    summary: 'S3에서 파일 삭제',
    description: `S3에서 파일을 삭제합니다.

**사용 방법:**
- \`url\`: S3 파일의 전체 URL을 제공하면 자동으로 키를 추출하여 삭제합니다.

**지원하는 URL 형식:**
- https://bucket.s3.region.amazonaws.com/key
- https://s3.region.amazonaws.com/bucket/key`,
  })
  @ApiResponse({
    status: 200,
    description: '파일 삭제 성공',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: '삭제 완료 메시지',
          example: '파일이 성공적으로 삭제되었습니다.',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'URL이 필요합니다',
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
  })
  async deleteFile(@Body() body: { url: string }) {
    const { url } = body;

    if (!url) {
      throw new BadRequestException('URL이 필요합니다');
    }

    const fileKey = this.extractKeyFromUrl(url);
    if (!fileKey) {
      throw new BadRequestException('유효하지 않은 URL 형식입니다');
    }

    await this.s3Service.deleteFile(fileKey);
    return {
      message: '파일이 성공적으로 삭제되었습니다.',
    };
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      // S3 URL 패턴들을 지원
      // 1. https://bucket.s3.region.amazonaws.com/key
      // 2. https://s3.region.amazonaws.com/bucket/key

      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // bucket.s3.region.amazonaws.com 형태
      if (urlObj.hostname.includes('.s3.')) {
        // 첫 번째 '/' 제거하고 반환
        return pathname.substring(1);
      }

      // s3.region.amazonaws.com/bucket 형태
      if (urlObj.hostname.includes('s3.') && pathname.includes('/')) {
        const pathParts = pathname.substring(1).split('/');
        if (pathParts.length > 1) {
          // bucket 부분 제거하고 나머지 경로 반환
          return pathParts.slice(1).join('/');
        }
      }

      return null;
    } catch {
      return null;
    }
  }
}
