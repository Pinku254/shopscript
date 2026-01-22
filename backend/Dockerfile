# Multi-stage Dockerfile for building and running the ShopScript backend

# Build stage: use Maven with JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy Maven files and source
COPY pom.xml ./
COPY src ./src

# Package the application (skip tests for faster builds)
RUN mvn -DskipTests package

# Run stage: use a lightweight JRE image
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /workspace/target/backend-0.0.1-SNAPSHOT.jar ./app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
