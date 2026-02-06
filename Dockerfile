# 1단계: 빌드 스테이지 (Gradle 사용)
FROM gradle:8-jdk17 AS build-stage
WORKDIR /app

# 빌드 속도 향상을 위해 라이브러리 캐시 먼저 복사
COPY build.gradle settings.gradle ./
RUN gradle build -x test --no-daemon > /dev/null 2>&1 || true

# 전체 소스 복사 및 빌드
COPY . .
# 테스트를 제외하고 실제 실행 가능한 jar 파일 생성
RUN gradle bootJar -x test --no-daemon

# 2단계: 실행 스테이지 (가벼운 JRE 사용)
FROM openjdk:17-jdk-slim
WORKDIR /app

# 빌드 단계에서 생성된 jar 파일만 가져오기
COPY --from=build-stage /app/build/libs/*.jar app.jar

# Spring Boot 기본 포트 8080 노출
EXPOSE 8080

# 운영 환경 프로파일 설정 (README 기준 prod)
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]