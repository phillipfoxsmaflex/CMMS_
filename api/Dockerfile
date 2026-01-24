# Build Stage
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY . .
RUN apt-get update && apt-get install -y maven curl
# Add Maven settings with reliable repository configuration
RUN mkdir -p /root/.m2 && \
    echo '<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 https://maven.apache.org/xsd/settings-1.0.0.xsd">' > /root/.m2/settings.xml && \
    echo '  <mirrors>' >> /root/.m2/settings.xml && \
    echo '    <mirror>' >> /root/.m2/settings.xml && \
    echo '      <id>central-mirror</id>' >> /root/.m2/settings.xml && \
    echo '      <name>Central Mirror</name>' >> /root/.m2/settings.xml && \
    echo '      <url>https://repo1.maven.org/maven2/</url>' >> /root/.m2/settings.xml && \
    echo '      <mirrorOf>central</mirrorOf>' >> /root/.m2/settings.xml && \
    echo '    </mirror>' >> /root/.m2/settings.xml && \
    echo '  </mirrors>' >> /root/.m2/settings.xml && \
    echo '</settings>' >> /root/.m2/settings.xml
# Run Maven with retry logic and extended timeout
RUN mvn --settings /root/.m2/settings.xml clean package -Dmaven.test.skip=true -Dmaven.wagon.http.connectionTimeout=30000 -Dmaven.wagon.http.readTimeout=30000


# Runtime Stage
FROM amazoncorretto:17-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the compiled Spring Boot application JAR file into the container at /app
COPY --from=build /app/target/*.jar my-spring-boot-app.jar

# Expose the port that the Spring Boot application will run on
EXPOSE 8080

# Specify the command to run on container startup
CMD ["java", "-jar", "/app/my-spring-boot-app.jar"]
