import { webcrypto } from 'crypto';

// Jest 환경에서 글로벌 crypto가 없을 수 있어 폴리필
if (!(globalThis as any).crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    writable: false,
    configurable: false,
    enumerable: false,
  });
}
