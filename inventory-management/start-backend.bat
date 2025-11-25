@echo off
echo ========================================
echo Starting KITA KITA Inventory Backend
echo ========================================
echo.

REM Set Database Configuration
REM Update these values to match your MySQL setup
set SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/kitakita_db?createDatabaseIfNotExist=true^&useSSL=false^&serverTimezone=UTC
set SPRING_DATASOURCE_USERNAME=root
set SPRING_DATASOURCE_PASSWORD=FuSz5590

REM Set JWT Configuration
REM IMPORTANT: Change this to a secure random string in production
set JWT_SECRET=395e860e6107f08b4e322aa15e8e7d94
set JWT_EXPIRATION=86400000

echo Database URL: %SPRING_DATASOURCE_URL%
echo Database Username: %SPRING_DATASOURCE_USERNAME%
echo.
echo NOTE: Make sure MySQL is running and the password is set above!
echo.

REM Start the Spring Boot application
echo Starting backend server...
call mvnw.cmd spring-boot:run

pause

