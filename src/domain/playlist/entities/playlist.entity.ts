import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Asmr } from '../../asmr/entities/asmr.entity';

@Entity('playlists')
export class Playlist {
  @ApiProperty({ description: '플레이리스트 ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: '플레이리스트 이름',
    example: '내가 좋아하는 ASMR',
  })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ApiProperty({
    description: '플레이리스트 URL',
    example: 'https://example.com/playlist/123',
  })
  @Column({ type: 'varchar', length: 500 })
  imgUrl: string;

  @ApiProperty({
    description: '플레이리스트 상태',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
  })
  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';

  @ApiProperty({
    description: '플레이리스트 생성일',
    example: '2024-01-15T10:30:00Z',
  })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({
    description: '플레이리스트 수정일',
    example: '2024-01-15T10:30:00Z',
  })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // 연관관계
  @OneToMany(() => Asmr, asmr => asmr.playlist)
  asmrs: Asmr[];
}
