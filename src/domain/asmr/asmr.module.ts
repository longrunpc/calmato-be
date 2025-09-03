import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsmrService } from './asmr.service';
import { AsmrController } from './asmr.controller';
import { Asmr } from './entities/asmr.entity';
import { S3Service } from '../../common/services/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Asmr])],
  controllers: [AsmrController],
  providers: [AsmrService, S3Service],
  exports: [AsmrService],
})
export class AsmrModule {}
