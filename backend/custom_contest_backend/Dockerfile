# Stage 1: Build the application using Maven and Java 17
FROM maven:3.9.0-eclipse-temurin-17 AS build
WORKDIR /app

# Copy your specific pom.xml and your source code
COPY pom.xml .
COPY src ./src

# Build the .jar file (skipping tests for a faster build)
RUN mvn clean package -DskipTests

# Stage 2: Run the application using a lightweight Java 17 environment
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Grab the compiled .jar file from Stage 1 and name it app.jar
COPY --from=build /app/target/*.jar app.jar

# Open up port 8080 so your React app can talk to it
EXPOSE 8080

# Start the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]