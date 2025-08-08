# Calmato Backend API

NestJS 기반의 Calmato 백엔드 API 서버입니다.

## ✨ 주요 기능

- 🔗 **Swagger API 문서**: `/api` 엔드포인트에서 API 문서 확인
- 🐳 **Docker 지원**: 컨테이너 기반 배포
- 🚀 **GitHub Actions CI/CD**: 자동 배포 파이프라인
- 🔒 **JWT 인증**: 보안 토큰 기반 인증

## 📋 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Docker (배포용)

## 🛠️ 로컬 개발 설정

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp env.example .env
# .env 파일을 편집하여 필요한 환경변수 설정

# 개발 서버 실행
npm run start:dev

# Swagger API 문서 확인
# http://localhost:3000/api
```

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## 🐳 Docker를 사용한 로컬 실행

```bash
# Docker 이미지 빌드
npm run docker:build

# 컨테이너 실행
npm run docker:up

# 로그 확인
npm run docker:logs

# 컨테이너 중지
npm run docker:down
```

## 🚀 EC2 배포

### 1. EC2 서버 초기 설정

```bash
# EC2 서버에서 실행
sudo bash scripts/setup-ec2.sh
```

### 2. GitHub Secrets 설정

Repository Settings > Secrets and variables > Actions에서 다음 secrets 추가:

- `EC2_HOST`: EC2 서버의 퍼블릭 IP
- `EC2_USERNAME`: SSH 사용자명 (보통 ubuntu)
- `EC2_PRIVATE_KEY`: SSH 개인키
- `JWT_SECRET`: JWT 서명용 비밀키
- `CORS_ORIGIN`: 허용할 도메인 (예: https://yourdomain.com)

### 3. 자동 배포

- `main` 브랜치에 push하면 자동으로 EC2 서버에 배포됩니다
- GitHub Actions에서 배포 진행상황을 확인할 수 있습니다

## 📊 API 문서

서버 실행 후 다음 URL에서 Swagger API 문서를 확인할 수 있습니다:

- **로컬**: http://localhost:3000/api
- **프로덕션**: http://YOUR_EC2_IP:3000/api

## 🛠️ 개발 스크립트

```bash
# 개발 서버 (Hot reload)
npm run start:dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start:prod

# 코드 포맷팅
npm run format

# 린팅
npm run lint

# Docker 명령어
npm run docker:build    # 이미지 빌드
npm run docker:run      # 컨테이너 실행
npm run docker:up       # 컴포즈 실행
npm run docker:down     # 컴포즈 중지
npm run docker:logs     # 로그 확인
```

## 📁 프로젝트 구조

```
src/
├── auth/           # 인증 모듈
├── config/         # 설정 파일들
├── domain/         # 도메인 모듈들
│   ├── playlist/   # 플레이리스트 관련
│   ├── post/       # 게시글 관련
│   └── user/       # 사용자 관련
├── middlewares/    # 미들웨어들
└── utils/          # 유틸리티 함수들
```

## 🔧 환경변수

`env.example` 파일을 참고하여 `.env` 파일을 생성하세요:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://yourdomain.com
```
