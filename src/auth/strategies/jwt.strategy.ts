import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../domain/user/entities/user.entity';
import { JwtPayload } from '../types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret-key',
    });
  }

  validate(payload: JwtPayload): Partial<User> {
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    } as Partial<User>;
  }
}
