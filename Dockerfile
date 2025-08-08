# Node.js 18 Alpine 이미지 사용 (경량화)
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production && npm cache clean --force

# 소스 코드 복사
COPY . .

# 애플리케이션 빌드
RUN npm run build

# 프로덕션 이미지
FROM node:18-alpine AS production

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 애플리케이션과 node_modules 복사
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# 애플리케이션 포트 노출
EXPOSE 3000

# 헬스체크 추가 (curl 설치 필요)
RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# 애플리케이션 실행
CMD ["node", "dist/main"] 