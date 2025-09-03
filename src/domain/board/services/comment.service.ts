import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Post } from '../entities/post.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(
    postId: number,
    userId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    // 게시글 존재 확인
    const post = await this.postRepository.findOne({
      where: { id: postId, status: 'ACTIVE' },
    });

    if (!post) {
      throw new NotFoundException(`ID ${postId}인 게시글을 찾을 수 없습니다.`);
    }

    // 부모 댓글 존재 확인 (대댓글인 경우)
    if (createCommentDto.parentCommentId) {
      const parentComment = await this.commentRepository.findOne({
        where: {
          id: createCommentDto.parentCommentId,
          postId,
          status: 'ACTIVE',
        },
      });

      if (!parentComment) {
        throw new NotFoundException('부모 댓글을 찾을 수 없습니다.');
      }
    }

    const comment = this.commentRepository.create({
      ...createCommentDto,
      postId,
      userId,
    });

    return await this.commentRepository.save(comment);
  }

  async findByPost(postId: number): Promise<Comment[]> {
    // 게시글 존재 확인
    const post = await this.postRepository.findOne({
      where: { id: postId, status: 'ACTIVE' },
    });

    if (!post) {
      throw new NotFoundException(`ID ${postId}인 게시글을 찾을 수 없습니다.`);
    }

    return await this.commentRepository.find({
      where: { postId, status: 'ACTIVE' },
      relations: ['user', 'parentComment', 'replies', 'replies.user'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id, status: 'ACTIVE' },
      relations: ['user', 'post'],
    });

    if (!comment) {
      throw new NotFoundException(`ID ${id}인 댓글을 찾을 수 없습니다.`);
    }

    return comment;
  }

  async update(
    id: number,
    userId: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.findOne(id);

    // 작성자 확인
    if (comment.userId !== userId) {
      throw new ForbiddenException('본인이 작성한 댓글만 수정할 수 있습니다.');
    }

    Object.assign(comment, updateCommentDto);
    return await this.commentRepository.save(comment);
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.findOne(id);

    // 작성자 확인
    if (comment.userId !== userId) {
      throw new ForbiddenException('본인이 작성한 댓글만 삭제할 수 있습니다.');
    }

    // 대댓글이 있는 경우 소프트 삭제, 없는 경우 하드 삭제
    const hasReplies = await this.commentRepository.count({
      where: { parentCommentId: id, status: 'ACTIVE' },
    });

    if (hasReplies > 0) {
      // 소프트 삭제
      comment.status = 'DELETED';
      comment.content = '삭제된 댓글입니다.';
      await this.commentRepository.save(comment);
    } else {
      // 하드 삭제
      await this.commentRepository.remove(comment);
    }
  }

  async findMyComments(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { userId, status: 'ACTIVE' },
      relations: ['post'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
