FROM openjdk:17

ARG JAR_FILE=./build/libs/*.jar
ARG SPRING_PROFILE

COPY ${JAR_FILE} uniro-server.jar

ENV SPRING_PROFILE=${SPRING_PROFILE}

ENTRYPOINT ["java", "-Duser.timezone=Asia/Seoul","-Dspring.profiles.active=${SPRING_PROFILE}" ,"-jar" ,"uniro-server.jar"]