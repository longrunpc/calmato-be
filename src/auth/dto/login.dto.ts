import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '이메일 주소', example: 'user@example.com' })
  @Transform(({ value }) => {
    if (typeof value === 'string') return value.trim().toLowerCase();
    if (value == null) return '';
    return String(value).trim().toLowerCase();
  })
  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsNotEmpty({ message: '이메일을 입력해주세요.' })
  email: string;

  @ApiProperty({ description: '비밀번호', example: 'Abcd1234!' })
  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @MaxLength(72, { message: '비밀번호는 72자 이하여야 합니다.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
    {
      message:
        '비밀번호는 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.',
    },
  )
  password: string;
}
