# ---- build ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml /workspace/pom.xml
COPY services/auth-service/pom.xml /workspace/services/auth-service/pom.xml
COPY services/user-service/pom.xml /workspace/services/user-service/pom.xml
COPY services/api-gateway/pom.xml /workspace/services/api-gateway/pom.xml
RUN mvn -q -e -DskipTests package || true

COPY services/auth-service/src /workspace/services/auth-service/src
RUN mvn -q -pl services/auth-service -DskipTests package spring-boot:repackage

# ---- run ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /workspace/services/auth-service/target/auth-service-0.1.0-SNAPSHOT.jar /app/app.jar
EXPOSE 8081
ENV JAVA_OPTS=""
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
