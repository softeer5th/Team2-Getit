FROM openjdk:17

ARG JAR_FILE=./build/libs/*.jar
ARG SPRING_PROFILE

COPY ${JAR_FILE} uniro-server.jar

ENV SPRING_PROFILE=${SPRING_PROFILE}

EXPOSE 9010

# JVM 메모리 설정 추가
ENTRYPOINT ["java", "-Duser.timezone=Asia/Seoul","-Dspring.profiles.active=${SPRING_PROFILE}","-XX:+HeapDumpOnOutOfMemoryError","-XX:HeapDumpPath=/tmp/heapdump.hprof", "-Xmx512m", "-Xms512m","-jar", "uniro-server.jar"]

