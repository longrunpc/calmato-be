import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CommentService } from '../services/comment.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';
import { Comment } from '../entities/comment.entity';

@ApiTags('댓글')
@Controller('boards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':boardType/:postId/comments')
  @ApiOperation({ summary: '댓글 작성' })
  @ApiParam({
    name: 'boardType',
    description: '게시판 타입',
    enum: ['free', 'request'],
  })
  @ApiParam({ name: 'postId', description: '게시글 ID' })
  @ApiResponse({
    status: 201,
    description: '댓글이 성공적으로 작성되었습니다.',
    type: Comment,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: User,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(postId, user.id, createCommentDto);
  }

  @Get(':boardType/:postId/comments')
  @ApiOperation({ summary: '게시글의 댓글 목록 조회' })
  @ApiParam({
    name: 'boardType',
    description: '게시판 타입',
    enum: ['free', 'request'],
  })
  @ApiParam({ name: 'postId', description: '게시글 ID' })
  @ApiResponse({
    status: 200,
    description: '댓글 목록을 성공적으로 조회했습니다.',
    type: [Comment],
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentService.findByPost(postId);
  }

  @Get('comments/my')
  @ApiOperation({ summary: '내가 작성한 댓글 목록' })
  @ApiResponse({
    status: 200,
    description: '내 댓글 목록을 성공적으로 조회했습니다.',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Comment' },
        },
        total: { type: 'number', example: 30 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        totalPages: { type: 'number', example: 2 },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  findMyComments(
    @CurrentUser() user: User,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 20,
  ) {
    return this.commentService.findMyComments(user.id, page, limit);
  }

  @Patch('comments/:id')
  @ApiOperation({ summary: '댓글 수정' })
  @ApiParam({ name: 'id', description: '댓글 ID' })
  @ApiResponse({
    status: 200,
    description: '댓글이 성공적으로 수정되었습니다.',
    type: Comment,
  })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(id, user.id, updateCommentDto);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiParam({ name: 'id', description: '댓글 ID' })
  @ApiResponse({
    status: 200,
    description: '댓글이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '댓글을 찾을 수 없습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.commentService.remove(id, user.id);
  }
}
