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

@Entity('comments')
export class Comment {
  @ApiProperty({ description: '댓글 ID', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '게시글 ID', example: 1 })
  @Column({ type: 'int' })
  postId: number;

  @ApiProperty({ description: '작성자 ID', example: 1 })
  @Column({ type: 'int' })
  userId: number;

  @ApiProperty({ description: '댓글 내용', example: '정말 좋은 글이네요!' })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    description: '부모 댓글 ID (대댓글용)',
    example: 1,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  parentCommentId?: number;

  @ApiProperty({
    description: '댓글 상태',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'DELETED', 'BLOCKED'],
  })
  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'DELETED', 'BLOCKED'],
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'DELETED' | 'BLOCKED';

  @ApiProperty({ description: '생성일', example: '2024-01-15T10:30:00Z' })
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: '수정일', example: '2024-01-15T10:30:00Z' })
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // 연관관계
  @ManyToOne('Post', 'comments')
  @JoinColumn({ name: 'postId' })
  post: any;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne('Comment', { nullable: true })
  @JoinColumn({ name: 'parentCommentId' })
  parentComment?: any;

  @OneToMany('Comment', 'parentComment')
  replies: any[];
}
