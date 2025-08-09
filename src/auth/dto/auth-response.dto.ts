import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../domain/user/entities/user.entity';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: '토큰 타입',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: '토큰 만료 시간 (초)',
    example: 604800,
  })
  expiresIn: number;

  @ApiProperty({
    description: '사용자 정보',
    type: User,
  })
  user: User;

  constructor(accessToken: string, user: User, expiresIn: number = 604800) {
    this.accessToken = accessToken;
    this.tokenType = 'Bearer';
    this.expiresIn = expiresIn;
    this.user = user;
  }
}
