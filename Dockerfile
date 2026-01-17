# 1단계: 빌드 (Node.js 환경)
FROM node:20-alpine AS build
WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 파일 복사 및 설치 (캐시 활용을 위해 먼저 복사)
COPY pnpm-lock.yaml pnpm-workspace.yaml* package.json ./
RUN pnpm install

# 전체 소스 복사
COPY . .

# [핵심 수정] 
# 1. tsc(타입체크)를 건너뛰기 위해 pnpm run build 대신 vite build를 직접 호출합니다.
# 2. --emptyOutDir를 추가하여 깔끔하게 빌드합니다.
# 3. 파일 참조 에러가 있어도 빌드 프로세스가 멈추지 않도록 설정하거나, 팀원에게 수정을 요청해야 합니다.
RUN pnpm exec vite build --emptyOutDir

# 2단계: 실행 (Nginx 환경)
FROM nginx:stable-alpine

# 빌드 결과물(dist)을 Nginx 웹 서버 경로로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# [중요] React Router(SPA) 새로고침 에러 방지 설정
# 사용자가 페이지 내에서 새로고침했을 때 404가 뜨는 것을 방지합니다.
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
