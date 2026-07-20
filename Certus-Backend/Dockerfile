FROM maven:3.9-eclipse-temurin-17 AS builder
# This image already contains linux + java17 + maven --> gives all this a name called builder
WORKDIR /app
# Creates a directory app, and every following instruction is executed there
COPY pom.xml .
# Copies maven configuration to /app
COPY mvnw .
COPY .mvn .mvn

# This would download all the dependencies
RUN ./mvnw dependency:go-offline

# Copy source code
COPY src src

# Build the JAR
RUN ./mvnw clean package -DskipTests
# Docker would now run the mvnw clean package command, which will build the jar file in the target folder
# target/certus-backend.jar

# Runtime Stage
# Linux + Java Runtime
FROM eclipse-temurin:17-jre
WORKDIR /app

# COPY ONLY THE JAR
COPY --from=builder /app/target/*.jar app.jar

# EXPOSE THE PORT
EXPOSE 8080

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]

# so when someone runs docker run certus-backend
# Docker automatically executes java -jar app.jar

# How to build the image
# Run this command -> docker build -t certus-backend:v1 .

# Run the container -> docker run -p 8080:8080 certus-backend:v1