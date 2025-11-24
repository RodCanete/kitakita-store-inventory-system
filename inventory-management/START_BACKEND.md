# How to Start the Backend Server

## Prerequisites

1. **Java 17** installed (check with `java -version`)
2. **Maven** installed (or use the included `mvnw` wrapper)
3. **MySQL Database** running and accessible

## Step 1: Configure Environment Variables

The backend requires these environment variables:

### Required Environment Variables:

1. **Database Configuration:**
   - `SPRING_DATASOURCE_URL` - MySQL connection URL
   - `SPRING_DATASOURCE_USERNAME` - MySQL username
   - `SPRING_DATASOURCE_PASSWORD` - MySQL password

2. **JWT Configuration:**
   - `JWT_SECRET` - Secret key for JWT token signing (use a strong random string)
   - `JWT_EXPIRATION` - Token expiration in milliseconds (optional, defaults to 86400000 = 24 hours)

### Example Setup:

#### Windows (PowerShell):
```powershell
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/kitakita_inventory?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="your_password"
$env:JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-256-bits"
$env:JWT_EXPIRATION="86400000"
```

#### Windows (Command Prompt):
```cmd
set SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/kitakita_inventory?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
set SPRING_DATASOURCE_USERNAME=root
set SPRING_DATASOURCE_PASSWORD=your_password
set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-256-bits
set JWT_EXPIRATION=86400000
```

#### Linux/Mac:
```bash
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/kitakita_inventory?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="your_password"
export JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-256-bits"
export JWT_EXPIRATION="86400000"
```

## Step 2: Start MySQL Database

Make sure MySQL is running:
```bash
# Check if MySQL is running
mysql -u root -p
```

Create the database (if it doesn't exist):
```sql
CREATE DATABASE IF NOT EXISTS kitakita_inventory;
```

## Step 3: Start the Backend Server

### Option A: Using Maven Wrapper (Recommended)

**Windows:**
```cmd
cd inventory-management
mvnw.cmd spring-boot:run
```

**Linux/Mac:**
```bash
cd inventory-management
./mvnw spring-boot:run
```

### Option B: Using Maven (if installed)

```bash
cd inventory-management
mvn spring-boot:run
```

### Option C: Using IDE (IntelliJ IDEA / Eclipse)

1. Open the `inventory-management` folder in your IDE
2. Find `KitaKitaInventoryApplication.java`
3. Right-click → Run 'KitaKitaInventoryApplication'

## Step 4: Verify Backend is Running

Once started, you should see:
```
Started KitaKitaInventoryApplication in X.XXX seconds
```

Test the connection:
- Open browser: `http://localhost:8080/api/auth/login`
- You should see an error response (not connection refused)

## Troubleshooting

### Port 8080 Already in Use
If port 8080 is already in use, you can change it by adding to `application.properties`:
```properties
server.port=8081
```
Then update your frontend `.env` file to match.

### Database Connection Errors
- Verify MySQL is running
- Check database credentials
- Ensure database exists or `createDatabaseIfNotExist=true` is in the URL

### JWT Secret Error
- Make sure `JWT_SECRET` is set
- Use a strong random string (at least 256 bits)

### Build Errors
- Run `mvn clean install` first
- Check Java version: `java -version` (should be 17+)

## Quick Start Script (Windows)

Create a file `start-backend.bat`:
```batch
@echo off
set SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/kitakita_inventory?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
set SPRING_DATASOURCE_USERNAME=root
set SPRING_DATASOURCE_PASSWORD=your_password
set JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-256-bits
set JWT_EXIRATION=86400000
cd inventory-management
mvnw.cmd spring-boot:run
```

## Quick Start Script (Linux/Mac)

Create a file `start-backend.sh`:
```bash
#!/bin/bash
export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/kitakita_inventory?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC"
export SPRING_DATASOURCE_USERNAME="root"
export SPRING_DATASOURCE_PASSWORD="your_password"
export JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-256-bits"
export JWT_EXPIRATION="86400000"
cd inventory-management
./mvnw spring-boot:run
```

Make it executable:
```bash
chmod +x start-backend.sh
```

