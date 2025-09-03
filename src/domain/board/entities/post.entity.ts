import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Asmr } from '../../asmr/entities/asmr.entity';
import { Playlist } from '../../playlist/entities/playlist.entity';

@Entity('posts')
export class Post {
  @ApiProperty({ description: '게시글 ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '제목', example: '빗소리 ASMR 추천해요!' })
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ description: '내용', example: '정말 좋은 ASMR입니다...' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    description: '게시판 타입',
    example: 'FREE',
    enum: ['FREE', 'REQUEST'],
  })
  @Column({
    type: 'enum',
    enum: ['FREE', 'REQUEST'],
  })
  boardType: 'FREE' | 'REQUEST';

  @ApiProperty({
    description: '첨부 이미지 URL 배열',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
  })
  @Column({ type: 'json', nullable: true })
  imageUrls: string[];

  @ApiProperty({ description: '작성자 ID', example: 1 })
  @Column({ type: 'int' })
  userId: number;

  @ApiProperty({ description: '조회수', example: 150 })
  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @ApiProperty({ description: '좋아요 수', example: 25 })
  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @ApiProperty({
    description: '게시글 상태',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'DELETED', 'BLOCKED'],
  })
  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'DELETED', 'BLOCKED'],
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'DELETED' | 'BLOCKED';

  // 자유게시판 전용 필드
  @ApiProperty({
    description: '자유게시판 카테고리',
    example: 'REVIEW',
    enum: ['REVIEW', 'QUESTION', 'DAILY', 'TIP'],
    required: false,
  })
  @Column({
    type: 'enum',
    enum: ['REVIEW', 'QUESTION', 'DAILY', 'TIP'],
    nullable: true,
  })
  category?: 'REVIEW' | 'QUESTION' | 'DAILY' | 'TIP';

  @ApiProperty({ description: '연관된 ASMR ID', example: 1, required: false })
  @Column({ type: 'int', nullable: true })
  asmrId?: number;

  @ApiProperty({
    description: '연관된 플레이리스트 ID',
    example: 1,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  playlistId?: number;

  // 곡신청게시판 전용 필드
  @ApiProperty({
    description: '신청 타입',
    example: 'ASMR',
    enum: ['ASMR', 'MUSIC'],
    required: false,
  })
  @Column({
    type: 'enum',
    enum: ['ASMR', 'MUSIC'],
    nullable: true,
  })
  requestType?: 'ASMR' | 'MUSIC';

  @ApiProperty({
    description: '신청 상태',
    example: 'PENDING',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'],
    required: false,
  })
  @Column({
    type: 'enum',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'],
    default: 'PENDING',
    nullable: true,
  })
  requestStatus?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

  @ApiProperty({
    description: '참고 유튜브 URL',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  youtubeUrl?: string;

  @ApiProperty({
    description: '상세 설명',
    example: '이런 느낌의 빗소리 ASMR을 만들어주세요',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: '생성일', example: '2024-01-15T10:30:00Z' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', example: '2024-01-15T10:30:00Z' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // 연관관계
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Asmr, { nullable: true })
  @JoinColumn({ name: 'asmrId' })
  asmr?: Asmr;

  @ManyToOne(() => Playlist, { nullable: true })
  @JoinColumn({ name: 'playlistId' })
  playlist?: Playlist;

  @OneToMany('Comment', 'post')
  comments: any[];

  @OneToMany('PostLike', 'post')
  postLikes: any[];
}
