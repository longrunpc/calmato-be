import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('기본')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: '헬로 메시지 조회',
    description: '기본 헬로 메시지를 반환합니다.',
  })
  @ApiResponse({ status: 200, description: '성공', type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}
