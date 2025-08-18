import {
  BadRequestException,
  Controller,
  Post,
  Query,
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
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/domain/user/entities/user.entity';

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
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: ['asmrImage', 'playlistImage', 'profileImage'],
        },
      },
    },
  })
  @ApiOperation({
    summary: '파일 업로드',
    description: '파일을 S3에 업로드합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '파일 업로드 성공',
    type: String,
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
    @Query('type') type: string,
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
