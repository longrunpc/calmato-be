import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Post } from './post.entity';

@Entity('post_likes')
@Unique(['postId', 'userId']) // 한 사용자가 같은 게시글에 중복 좋아요 방지
export class PostLike {
  @ApiProperty({ description: '좋아요 ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '게시글 ID', example: 1 })
  @Column({ type: 'int' })
  postId: number;

  @ApiProperty({ description: '사용자 ID', example: 1 })
  @Column({ type: 'int' })
  userId: number;

  @ApiProperty({ description: '생성일', example: '2024-01-15T10:30:00Z' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // 연관관계
  @ManyToOne(() => Post, post => post.postLikes)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
