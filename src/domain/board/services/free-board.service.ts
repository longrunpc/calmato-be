import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { PostLike } from '../entities/post-like.entity';
import { CreateFreePostDto } from '../dto/create-free-post.dto';
import { UpdateFreePostDto } from '../dto/update-post.dto';
import { FreeBoardQueryDto } from '../dto/board-query.dto';
import { S3Service } from '../../../common/services/s3.service';

@Injectable()
export class FreeBoardService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>,
    private s3Service: S3Service,
  ) {}

  async create(
    userId: number,
    createFreePostDto: CreateFreePostDto,
  ): Promise<Post> {
    const post = this.postRepository.create({
      ...createFreePostDto,
      userId,
      boardType: 'FREE',
    });

    return await this.postRepository.save(post);
  }

  async findAll(query: FreeBoardQueryDto) {
    const {
      page = 1,
      limit = 20,
      category,
      search,
      sort,
      asmrId,
      playlistId,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.asmr', 'asmr')
      .leftJoinAndSelect('post.playlist', 'playlist')
      .leftJoinAndSelect('post.comments', 'comments')
      .where('post.boardType = :boardType', { boardType: 'FREE' })
      .andWhere('post.status = :status', { status: 'ACTIVE' });

    // 필터링
    if (category) {
      queryBuilder.andWhere('post.category = :category', { category });
    }

    if (asmrId) {
      queryBuilder.andWhere('post.asmrId = :asmrId', { asmrId });
    }

    if (playlistId) {
      queryBuilder.andWhere('post.playlistId = :playlistId', { playlistId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 정렬
    switch (sort) {
      case 'popular':
        queryBuilder.orderBy('post.likeCount', 'DESC');
        break;
      case 'views':
        queryBuilder.orderBy('post.viewCount', 'DESC');
        break;
      default:
        queryBuilder.orderBy('post.createdAt', 'DESC');
    }

    const [posts, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number, userId?: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id, boardType: 'FREE', status: 'ACTIVE' },
      relations: ['user', 'asmr', 'playlist', 'comments', 'comments.user'],
    });

    if (!post) {
      throw new NotFoundException(`ID ${id}인 게시글을 찾을 수 없습니다.`);
    }

    // 조회수 증가 (작성자가 아닌 경우에만)
    if (userId !== post.userId) {
      await this.postRepository.update(id, {
        viewCount: () => 'viewCount + 1',
      });
    }

    return post;
  }

  async update(
    id: number,
    userId: number,
    updateFreePostDto: UpdateFreePostDto,
  ): Promise<Post> {
    const post = await this.findOne(id);

    // 작성자 확인
    if (post.userId !== userId) {
      throw new ForbiddenException(
        '본인이 작성한 게시글만 수정할 수 있습니다.',
      );
    }

    // 기존 이미지와 새 이미지 비교하여 삭제할 이미지 처리
    if (post.imageUrls && updateFreePostDto.imageUrls) {
      const imagesToDelete = post.imageUrls.filter(
        url => !updateFreePostDto.imageUrls!.includes(url),
      );

      for (const imageUrl of imagesToDelete) {
        await this.deleteImageFromS3(imageUrl);
      }
    }

    Object.assign(post, updateFreePostDto);
    return await this.postRepository.save(post);
  }

  async remove(id: number, userId: number): Promise<void> {
    const post = await this.findOne(id);

    // 작성자 확인
    if (post.userId !== userId) {
      throw new ForbiddenException(
        '본인이 작성한 게시글만 삭제할 수 있습니다.',
      );
    }

    // S3에서 이미지 삭제
    if (post.imageUrls) {
      for (const imageUrl of post.imageUrls) {
        await this.deleteImageFromS3(imageUrl);
      }
    }

    // 소프트 삭제
    post.status = 'DELETED';
    await this.postRepository.save(post);
  }

  async toggleLike(
    postId: number,
    userId: number,
  ): Promise<{ liked: boolean; likeCount: number }> {
    const post = await this.postRepository.findOne({
      where: { id: postId, boardType: 'FREE', status: 'ACTIVE' },
    });

    if (!post) {
      throw new NotFoundException(`ID ${postId}인 게시글을 찾을 수 없습니다.`);
    }

    const existingLike = await this.postLikeRepository.findOne({
      where: { postId, userId },
    });

    if (existingLike) {
      // 좋아요 취소
      await this.postLikeRepository.remove(existingLike);
      await this.postRepository.update(postId, {
        likeCount: () => 'likeCount - 1',
      });

      const updatedPost = await this.postRepository.findOne({
        where: { id: postId },
      });
      return { liked: false, likeCount: updatedPost?.likeCount || 0 };
    } else {
      // 좋아요 추가
      const newLike = this.postLikeRepository.create({ postId, userId });
      await this.postLikeRepository.save(newLike);
      await this.postRepository.update(postId, {
        likeCount: () => 'likeCount + 1',
      });

      const updatedPost = await this.postRepository.findOne({
        where: { id: postId },
      });
      return { liked: true, likeCount: updatedPost?.likeCount || 0 };
    }
  }

  async findMyPosts(userId: number, query: FreeBoardQueryDto) {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [posts, total] = await this.postRepository.findAndCount({
      where: { userId, boardType: 'FREE', status: 'ACTIVE' },
      relations: ['asmr', 'playlist'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async deleteImageFromS3(imageUrl: string): Promise<void> {
    try {
      const urlParts = imageUrl.split('/');
      const key = urlParts.slice(-3).join('/'); // freePostImage/userId/filename 형태
      await this.s3Service.deleteFile(key);
    } catch (error) {
      console.error('S3 이미지 삭제 실패:', error);
    }
  }
}
