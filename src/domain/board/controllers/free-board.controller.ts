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
import { FreeBoardService } from '../services/free-board.service';
import { CreateFreePostDto } from '../dto/create-free-post.dto';
import { UpdateFreePostDto } from '../dto/update-post.dto';
import { FreeBoardQueryDto } from '../dto/board-query.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';
import { Post as PostEntity } from '../entities/post.entity';

@ApiTags('자유게시판')
@Controller('boards/free')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FreeBoardController {
  constructor(private readonly freeBoardService: FreeBoardService) {}

  @Post()
  @ApiOperation({ summary: '자유게시판 글 작성' })
  @ApiResponse({
    status: 201,
    description: '게시글이 성공적으로 작성되었습니다.',
    type: PostEntity,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  create(
    @CurrentUser() user: User,
    @Body() createFreePostDto: CreateFreePostDto,
  ) {
    return this.freeBoardService.create(user.id, createFreePostDto);
  }

  @Get()
  @ApiOperation({ summary: '자유게시판 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '게시글 목록을 성공적으로 조회했습니다.',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Post' } },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  findAll(@Query() query: FreeBoardQueryDto) {
    return this.freeBoardService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: '내가 작성한 자유게시판 글 목록' })
  @ApiResponse({
    status: 200,
    description: '내 게시글 목록을 성공적으로 조회했습니다.',
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  findMyPosts(@CurrentUser() user: User, @Query() query: FreeBoardQueryDto) {
    return this.freeBoardService.findMyPosts(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 자유게시판 글 조회' })
  @ApiParam({ name: 'id', description: '게시글 ID' })
  @ApiResponse({
    status: 200,
    description: '게시글을 성공적으로 조회했습니다.',
    type: PostEntity,
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.freeBoardService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '자유게시판 글 수정' })
  @ApiParam({ name: 'id', description: '게시글 ID' })
  @ApiResponse({
    status: 200,
    description: '게시글이 성공적으로 수정되었습니다.',
    type: PostEntity,
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() updateFreePostDto: UpdateFreePostDto,
  ) {
    return this.freeBoardService.update(id, user.id, updateFreePostDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '자유게시판 글 삭제' })
  @ApiParam({ name: 'id', description: '게시글 ID' })
  @ApiResponse({
    status: 200,
    description: '게시글이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.freeBoardService.remove(id, user.id);
  }

  @Post(':id/like')
  @ApiOperation({ summary: '자유게시판 글 좋아요/취소' })
  @ApiParam({ name: 'id', description: '게시글 ID' })
  @ApiResponse({
    status: 200,
    description: '좋아요 상태가 성공적으로 변경되었습니다.',
    schema: {
      type: 'object',
      properties: {
        liked: { type: 'boolean', example: true },
        likeCount: { type: 'number', example: 15 },
      },
    },
  })
  @ApiResponse({ status: 404, description: '게시글을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  toggleLike(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.freeBoardService.toggleLike(id, user.id);
  }
}
