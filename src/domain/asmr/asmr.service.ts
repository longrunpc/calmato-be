import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Service } from '../../common/services/s3.service';
import { Asmr } from './entities/asmr.entity';
import { CreateAsmrDto } from './dto/create-asmr.dto';
import { UpdateAsmrDto } from './dto/update-asmr.dto';

@Injectable()
export class AsmrService {
  constructor(
    @InjectRepository(Asmr)
    private asmrRepository: Repository<Asmr>,
    private s3Service: S3Service,
  ) {}

  async create(createAsmrDto: CreateAsmrDto): Promise<Asmr> {
    const asmr = this.asmrRepository.create(createAsmrDto);
    return await this.asmrRepository.save(asmr);
  }

  async findAll(): Promise<Asmr[]> {
    return await this.asmrRepository.find({
      relations: ['playlist'],
    });
  }

  async findByPlaylistId(playlistId: number): Promise<Asmr[]> {
    return await this.asmrRepository.find({
      where: { playlistId },
      relations: ['playlist'],
    });
  }

  async findOne(id: number): Promise<Asmr> {
    const asmr = await this.asmrRepository.findOne({
      where: { id },
      relations: ['playlist'],
    });

    if (!asmr) {
      throw new NotFoundException(`ID ${id}인 ASMR을 찾을 수 없습니다.`);
    }

    return asmr;
  }

  async update(id: number, updateAsmrDto: UpdateAsmrDto): Promise<Asmr> {
    const asmr = await this.findOne(id);

    // 기존 이미지 URL이 있고 새로운 이미지 URL이 다르면 기존 이미지 삭제
    if (
      asmr.imageUrl &&
      updateAsmrDto.imageUrl &&
      asmr.imageUrl !== updateAsmrDto.imageUrl
    ) {
      await this.deleteFileFromS3(asmr.imageUrl);
    }

    // 기존 음악 URL이 있고 새로운 음악 URL이 다르면 기존 음악 파일 삭제
    if (
      asmr.musicUrl &&
      updateAsmrDto.musicUrl &&
      asmr.musicUrl !== updateAsmrDto.musicUrl
    ) {
      await this.deleteFileFromS3(asmr.musicUrl);
    }

    Object.assign(asmr, updateAsmrDto);
    return await this.asmrRepository.save(asmr);
  }

  async remove(id: number): Promise<void> {
    const asmr = await this.findOne(id);

    // S3에서 이미지 삭제
    if (asmr.imageUrl) {
      await this.deleteFileFromS3(asmr.imageUrl);
    }

    // S3에서 음악 파일 삭제
    if (asmr.musicUrl) {
      await this.deleteFileFromS3(asmr.musicUrl);
    }

    // 완전 삭제
    await this.asmrRepository.remove(asmr);
  }

  private async deleteFileFromS3(fileUrl: string): Promise<void> {
    try {
      // URL에서 S3 키 추출 (도메인 부분 제거)
      const urlParts = fileUrl.split('/');
      const key = urlParts.slice(-3).join('/'); // asmrImage/userId/filename 또는 asmrMusic/userId/filename 형태
      await this.s3Service.deleteFile(key);
    } catch (error) {
      console.error('S3 파일 삭제 실패:', error);
      // 파일 삭제 실패해도 ASMR 삭제는 진행
    }
  }
}
