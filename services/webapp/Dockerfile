# syntax=docker/dockerfile:1
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy parent + module POMs first (better layer caching)
COPY pom.xml ./pom.xml
COPY services/api-gateway/pom.xml ./services/api-gateway/pom.xml
COPY services/auth-service/pom.xml ./services/auth-service/pom.xml
COPY services/user-service/pom.xml ./services/user-service/pom.xml
COPY services/webapp/pom.xml ./services/webapp/pom.xml

# Download deps
RUN mvn -q -pl services/webapp dependency:go-offline

# Copy sources
COPY services/webapp/src ./services/webapp/src

# Build
RUN mvn -q -pl services/webapp -DskipTests package spring-boot:repackage

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/services/webapp/target/*-SNAPSHOT.jar app.jar
EXPOSE 8090
ENTRYPOINT ["java","-jar","/app/app.jar"]
