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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Playlist } from './entities/playlist.entity';

@ApiTags('playlists')
@Controller('playlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post()
  @ApiOperation({ summary: '플레이리스트 생성' })
  @ApiResponse({
    status: 201,
    description: '플레이리스트가 성공적으로 생성되었습니다.',
    type: Playlist,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  create(@Body() createPlaylistDto: CreatePlaylistDto) {
    return this.playlistService.create(createPlaylistDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 플레이리스트 조회' })
  @ApiResponse({
    status: 200,
    description: '플레이리스트 목록을 성공적으로 조회했습니다.',
    type: [Playlist],
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  findAll() {
    return this.playlistService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 플레이리스트 조회' })
  @ApiParam({ name: 'id', description: '플레이리스트 ID' })
  @ApiResponse({
    status: 200,
    description: '플레이리스트를 성공적으로 조회했습니다.',
    type: Playlist,
  })
  @ApiResponse({ status: 404, description: '플레이리스트를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.playlistService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '플레이리스트 수정' })
  @ApiParam({ name: 'id', description: '플레이리스트 ID' })
  @ApiResponse({
    status: 200,
    description: '플레이리스트가 성공적으로 수정되었습니다.',
    type: Playlist,
  })
  @ApiResponse({ status: 404, description: '플레이리스트를 찾을 수 없습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
  ) {
    return this.playlistService.update(id, updatePlaylistDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '플레이리스트 삭제' })
  @ApiParam({ name: 'id', description: '플레이리스트 ID' })
  @ApiResponse({
    status: 200,
    description: '플레이리스트가 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: '플레이리스트를 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.playlistService.remove(id);
  }
}
