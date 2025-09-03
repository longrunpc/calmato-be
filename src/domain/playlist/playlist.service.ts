import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Service } from '../../common/services/s3.service';
import { Playlist } from './entities/playlist.entity';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectRepository(Playlist)
    private playlistRepository: Repository<Playlist>,
    private s3Service: S3Service,
  ) {}

  async create(createPlaylistDto: CreatePlaylistDto): Promise<Playlist> {
    const playlist = this.playlistRepository.create(createPlaylistDto);
    return await this.playlistRepository.save(playlist);
  }

  async findAll(): Promise<Playlist[]> {
    return await this.playlistRepository.find({
      relations: ['asmrs'],
      where: { status: 'ACTIVE' },
    });
  }

  async findOne(id: number): Promise<Playlist> {
    const playlist = await this.playlistRepository.findOne({
      where: { id },
      relations: ['asmrs'],
    });

    if (!playlist) {
      throw new NotFoundException(`ID ${id}인 플레이리스트를 찾을 수 없습니다.`);
    }

    return playlist;
  }

  async update(id: number, updatePlaylistDto: UpdatePlaylistDto): Promise<Playlist> {
    const playlist = await this.findOne(id);
    
    // 기존 이미지 URL이 있고 새로운 이미지 URL이 다르면 기존 이미지 삭제
    if (playlist.imgUrl && updatePlaylistDto.imgUrl && playlist.imgUrl !== updatePlaylistDto.imgUrl) {
      await this.deleteImageFromS3(playlist.imgUrl);
    }

    Object.assign(playlist, updatePlaylistDto);
    return await this.playlistRepository.save(playlist);
  }

  async remove(id: number): Promise<void> {
    const playlist = await this.findOne(id);
    
    // S3에서 이미지 삭제
    if (playlist.imgUrl) {
      await this.deleteImageFromS3(playlist.imgUrl);
    }

    // 소프트 삭제 (상태를 DELETED로 변경)
    playlist.status = 'DELETED';
    await this.playlistRepository.save(playlist);
  }

  private async deleteImageFromS3(imageUrl: string): Promise<void> {
    try {
      // URL에서 S3 키 추출 (도메인 부분 제거)
      const urlParts = imageUrl.split('/');
      const key = urlParts.slice(-3).join('/'); // playlistImage/userId/filename 형태
      await this.s3Service.deleteFile(key);
    } catch (error) {
      console.error('S3 이미지 삭제 실패:', error);
      // 이미지 삭제 실패해도 플레이리스트 삭제는 진행
    }
  }
}
