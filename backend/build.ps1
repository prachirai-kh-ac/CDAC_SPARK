docker run --rm -v ${PWD}:/app -w /app maven:3.9-eclipse-temurin-17-alpine mvn clean package -DskipTests
if ($LASTEXITCODE -eq 0) {
    docker-compose up -d
} else {
    Write-Host "Maven build failed."
}
