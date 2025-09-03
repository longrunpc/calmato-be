import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Playlist } from '../../playlist/entities/playlist.entity';

@Entity('asmrs')
export class Asmr {
  @ApiProperty({ description: 'ASMR ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '플레이리스트 ID', example: 1 })
  @Column({ type: 'int' })
  playlistId: number;

  @ApiProperty({ description: 'ASMR 이름', example: '빗소리 ASMR' })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: 'ASMR 이미지 URL',
    example: 'https://example.com/images/asmr-image.jpg',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl: string;

  @ApiProperty({
    description: 'YouTube URL',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  youtubeUrl: string;

  @ApiProperty({
    description: '음악 파일 URL',
    example: 'https://example.com/music/rain-sound.mp3',
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  musicUrl: string;

  @ApiProperty({ description: 'ASMR 생성일', example: '2024-01-15T10:30:00Z' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: 'ASMR 수정일', example: '2024-01-15T10:30:00Z' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // 연관관계
  @ManyToOne(() => Playlist)
  @JoinColumn({ name: 'playlistId' })
  playlist: Playlist;
}
