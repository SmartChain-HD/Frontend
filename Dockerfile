# 1단계: 빌드 스테이지
FROM node:18-alpine AS build-stage
WORKDIR /app

# 패키지 설치를 위해 설정 파일 복사
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 전체 소스 복사 및 빌드
COPY . .
RUN npm run build -- --skipLibCheck || npx vite build
# 2단계: 실행 스테이지 (Nginx 사용)
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# 빌드 단계에서 생성된 dist 폴더의 결과물을 Nginx 폴더로 복사
# Vite의 기본 빌드 폴더명은 'dist'입니다.
COPY --from=build-stage /app/dist .

# Nginx의 기본 80포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]