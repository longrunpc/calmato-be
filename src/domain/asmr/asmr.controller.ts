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
  ApiQuery,
} from '@nestjs/swagger';
import { AsmrService } from './asmr.service';
import { CreateAsmrDto } from './dto/create-asmr.dto';
import { UpdateAsmrDto } from './dto/update-asmr.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Asmr } from './entities/asmr.entity';

@ApiTags('asmrs')
@Controller('asmrs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AsmrController {
  constructor(private readonly asmrService: AsmrService) {}

  @Post()
  @ApiOperation({ summary: 'ASMR 생성' })
  @ApiResponse({
    status: 201,
    description: 'ASMR이 성공적으로 생성되었습니다.',
    type: Asmr,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  create(@Body() createAsmrDto: CreateAsmrDto) {
    return this.asmrService.create(createAsmrDto);
  }

  @Get()
  @ApiOperation({ summary: 'ASMR 목록 조회' })
  @ApiQuery({
    name: 'playlistId',
    required: false,
    description: '특정 플레이리스트의 ASMR만 조회',
  })
  @ApiResponse({
    status: 200,
    description: 'ASMR 목록을 성공적으로 조회했습니다.',
    type: [Asmr],
  })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  findAll(@Query('playlistId', ParseIntPipe) playlistId?: number) {
    if (playlistId) {
      return this.asmrService.findByPlaylistId(playlistId);
    }
    return this.asmrService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 ASMR 조회' })
  @ApiParam({ name: 'id', description: 'ASMR ID' })
  @ApiResponse({
    status: 200,
    description: 'ASMR을 성공적으로 조회했습니다.',
    type: Asmr,
  })
  @ApiResponse({ status: 404, description: 'ASMR을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asmrService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'ASMR 수정' })
  @ApiParam({ name: 'id', description: 'ASMR ID' })
  @ApiResponse({
    status: 200,
    description: 'ASMR이 성공적으로 수정되었습니다.',
    type: Asmr,
  })
  @ApiResponse({ status: 404, description: 'ASMR을 찾을 수 없습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsmrDto: UpdateAsmrDto,
  ) {
    return this.asmrService.update(id, updateAsmrDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ASMR 삭제' })
  @ApiParam({ name: 'id', description: 'ASMR ID' })
  @ApiResponse({
    status: 200,
    description: 'ASMR이 성공적으로 삭제되었습니다.',
  })
  @ApiResponse({ status: 404, description: 'ASMR을 찾을 수 없습니다.' })
  @ApiResponse({ status: 401, description: '인증되지 않은 사용자' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asmrService.remove(id);
  }
}
