import * as bcrypt from 'bcryptjs';

export class PasswordUtil {
  /**
   * 비밀번호를 해싱합니다.
   * @param password 원본 비밀번호
   * @param rounds 솔트 라운드 (기본값: 10)
   * @returns 해싱된 비밀번호
   */
  static async hash(password: string, rounds: number = 10): Promise<string> {
    return bcrypt.hash(password, rounds);
  }

  /**
   * 비밀번호를 검증합니다.
   * @param password 원본 비밀번호
   * @param hashedPassword 해싱된 비밀번호
   * @returns 검증 결과
   */
  static async compare(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * 비밀번호 강도를 검사합니다.
   * @param password 검사할 비밀번호
   * @returns 강도 점수 (0-100)
   */
  static checkStrength(password: string): {
    score: number;
    requirements: {
      length: boolean;
      lowercase: boolean;
      uppercase: boolean;
      number: boolean;
      special: boolean;
    };
  } {
    const requirements = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length * 20;

    return { score, requirements };
  }

  /**
   * 안전한 임시 비밀번호를 생성합니다.
   * @param length 비밀번호 길이 (기본값: 12)
   * @returns 임시 비밀번호
   */
  static generateTemporary(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*';
    const allChars = lowercase + uppercase + numbers + special;

    let password = '';

    // 각 문자 유형에서 최소 하나씩 포함
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // 나머지 길이를 랜덤하게 채움
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // 문자열을 섞음
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }
}
