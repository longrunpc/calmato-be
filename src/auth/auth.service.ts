import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user/entities/user.entity';
import { PasswordUtil } from '../utils/password.util';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './types/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingByEmail = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingByEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const hashedPassword = await PasswordUtil.hash(registerDto.password);

    const user = this.userRepository.create({
      email: registerDto.email,
      name: registerDto.name,
      password: hashedPassword,
      role: registerDto.role ?? 'USER',
    });
    const saved = await this.userRepository.save(user);

    const payload: JwtPayload = {
      sub: saved.id,
      email: saved.email,
      role: saved.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return new AuthResponseDto(accessToken, saved);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: ['id', 'email', 'name', 'role', 'password'],
    });
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const isPasswordValid = await PasswordUtil.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    // 비밀번호는 select로만 포함되었으므로 응답용으로 제거하거나 다시 조회
    const safeUser = await this.userRepository.findOne({
      where: { id: user.id },
    });
    return new AuthResponseDto(accessToken, safeUser as User);
  }

  async validateUserById(userId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user ?? null;
  }

  async getProfile(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }
}
