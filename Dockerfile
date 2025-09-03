# Node.js 23 버전을 사용하여 모든 의존성을 설치하고 빌드합니다.
FROM node:24-alpine AS builder

# 작업 디렉토리를 설정합니다.
WORKDIR /app

# package.json 파일들을 복사합니다.
COPY package*.json ./

# 모든 의존성(개발 및 운영)을 설치합니다.
RUN npm ci

# 소스 코드를 복사합니다.
COPY . .

# NestJS 애플리케이션을 빌드합니다.
RUN npm run build

# -- Production Stage --
# 더 가벼운 Node.js 런타임 이미지를 사용합니다.
FROM node:24-alpine AS production

# 작업 디렉토리 설정
WORKDIR /app

# builder 스테이지에서 빌드된 결과물(dist 폴더)만 복사합니다.
COPY --from=builder /app/dist ./dist

# 프로덕션에 필요한 package.json 파일만 복사합니다.
COPY package*.json ./

# 운영에 필요한 의존성만 다시 설치하여 이미지 크기를 줄입니다.
RUN npm ci --only=production

# 애플리케이션 포트 노출
EXPOSE 3000

# 애플리케이션 실행
CMD ["node", "dist/main"]
