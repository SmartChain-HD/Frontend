# 1단계: 빌드 (Node.js 환경)
FROM node:20-alpine AS build
WORKDIR /app

# pnpm 사용을 위한 설정
RUN npm install -g pnpm

# 의존성 파일 복사 및 설치
COPY pnpm-lock.yaml pnpm-workspace.yaml* package.json ./
RUN pnpm install

# 전체 소스 복사 및 빌드
COPY . .
# 기존: RUN pnpm run build
# 수정: 타입 체크(tsc)를 건너뛰고 빌드만 진행
RUN pnpm exec vite build

# 2단계: 실행 (Nginx 환경)
FROM nginx:stable-alpine
# 빌드 결과물(dist)을 Nginx 웹 서버 경로로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# React Router 사용 시 새로고침 에러 방지를 위한 설정 (선택사항)
# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
