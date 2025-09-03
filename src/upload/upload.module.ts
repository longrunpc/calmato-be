import { Module } from '@nestjs/common';
import { S3Service } from '../common/services/s3.service';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [S3Service],
  exports: [S3Service],
})
export class UploadModule {}
