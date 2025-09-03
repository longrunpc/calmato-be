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
  ApiBody,
} from '@nestjs/swagger';
import { RequestBoardService } from '../services/request-board.service';
import { CreateRequestPostDto } from '../dto/create-request-post.dto';
import { UpdateRequestPostDto } from '../dto/update-post.dto';
import { RequestBoardQueryDto } from '../dto/board-query.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { User } from '../../user/entities/user.entity';
import { Post as PostEntity } from '../entities/post.entity';

@ApiTags('곡신청게시판')
@Controller('boards/request')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RequestBoardController {
  constructor(private readonly requestBoardService: RequestBoardService) {}

  @Post()
  @ApiOperation({ summary: '곡신청 작성' })
  @ApiResponse({
    status: 201,
    description: '곡신청이 성공적으로 작성되었습니다.',
    type: PostEntity,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  create(
    @CurrentUser() user: User,
    @Body() createRequestPostDto: CreateRequestPostDto,
  ) {
    return this.requestBoardService.create(user.id, createRequestPostDto);
  }

  @Get()
  @ApiOperation({ summary: '곡신청 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '곡신청 목록을 성공적으로 조회했습니다.',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/Post' } },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        totalPages: { type: 'number', example: 3 },
      },
    },
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  findAll(@Query() query: RequestBoardQueryDto) {
    return this.requestBoardService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: '내가 작성한 곡신청 목록' })
  @ApiResponse({
    status: 200,
    description: '내 곡신청 목록을 성공적으로 조회했습니다.',
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  findMyRequests(
    @CurrentUser() user: User,
    @Query() query: RequestBoardQueryDto,
  ) {
    return this.requestBoardService.findMyRequests(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 곡신청 조회' })
  @ApiParam({ name: 'id', description: '곡신청 ID' })
  @ApiResponse({
    status: 200,
    description: '곡신청을 성공적으로 조회했습니다.',
    type: PostEntity,
  })
  @ApiResponse({ status: 404, description: '곡신청을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.requestBoardService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '곡신청 수정' })
  @ApiParam({ name: 'id', description: '곡신청 ID' })
  @ApiResponse({
    status: 200,
    description: '곡신청이 성공적으로 수정되었습니다.',
    type: PostEntity,
  })
  @ApiResponse({ status: 404, description: '곡신청을 찾을 수 없습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() updateRequestPostDto: UpdateRequestPostDto,
  ) {
    return this.requestBoardService.update(id, user.id, updateRequestPostDto);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: '곡신청 상태 변경 (관리자 전용)',
    description:
      '곡신청의 처리 상태를 변경합니다. 현재는 모든 인증된 사용자가 가능하지만, 추후 관리자 권한으로 제한될 예정입니다.',
  })
  @ApiParam({ name: 'id', description: '곡신청 ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'],
          example: 'IN_PROGRESS',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '곡신청 상태가 성공적으로 변경되었습니다.',
    type: PostEntity,
  })
  @ApiResponse({ status: 404, description: '곡신청을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status')
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED',
  ) {
    return this.requestBoardService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: '곡신청 삭제' })
  @ApiParam({ name: 'id', description: '곡신청 ID' })
  @ApiResponse({
    status: 200,
    description: '곡신청이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '곡신청을 찾을 수 없습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.requestBoardService.remove(id, user.id);
  }

  @Post(':id/like')
  @ApiOperation({ summary: '곡신청 좋아요/취소' })
  @ApiParam({ name: 'id', description: '곡신청 ID' })
  @ApiResponse({
    status: 200,
    description: '좋아요 상태가 성공적으로 변경되었습니다.',
    schema: {
      type: 'object',
      properties: {
        liked: { type: 'boolean', example: true },
        likeCount: { type: 'number', example: 25 },
      },
    },
  })
  @ApiResponse({ status: 404, description: '곡신청을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  toggleLike(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.requestBoardService.toggleLike(id, user.id);
  }
}
