FROM openjdk:17

ARG JAR_FILE=./build/libs/*.jar
ARG SPRING_PROFILE
# 빌드 시점에 JVM 옵션을 정의 (기본값: -Xmx500m)
ARG JAVA_OPTS="-Xmx500m"

COPY ${JAR_FILE} uniro-server.jar

# 런타임 환경 변수 설정
ENV SPRING_PROFILE=${SPRING_PROFILE}
ENV JAVA_OPTS=${JAVA_OPTS}

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -Duser.timezone=Asia/Seoul -Dspring.profiles.active=${SPRING_PROFILE} -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/heapdump.hprof -jar uniro-server.jar"]