FROM openjdk:17

ARG JAR_FILE=./build/libs/*.jar
ARG SPRING_PROFILE

COPY ${JAR_FILE} uniro-server.jar

ENV SPRING_PROFILE=${SPRING_PROFILE}

# JVM 메모리 설정 추가
ENTRYPOINT ["java", "-Duser.timezone=Asia/Seoul", "-Dspring.profiles.active=${SPRING_PROFILE}", "-XX:+HeapDumpOnOutOfMemoryError", "-XX:HeapDumpPath=/tmp/heapdump.hprof", "-jar", "uniro-server.jar"]
