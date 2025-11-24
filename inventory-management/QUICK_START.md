# Quick Start Guide - Backend Server

## Step 1: Update the Startup Script

1. Open `start-backend.bat` in the `inventory-management` folder
2. Find this line: `set SPRING_DATASOURCE_PASSWORD=`
3. Add your MySQL password: `set SPRING_DATASOURCE_PASSWORD=your_password_here`

## Step 2: Start the Backend

**Option A: Double-click the script**
- Double-click `start-backend.bat` in the `inventory-management` folder

**Option B: Run from Command Prompt**
```cmd
cd "C:\Users\Rod Gabrielle\Desktop\KitaKita Inventory System\inventory-management"
start-backend.bat
```

**Option C: Manual Start (if script doesn't work)**

Open PowerShell in the `inventory-management` folder and run:

```powershell
# Set environment variables (REPLACE 'your_password' with your actual MySQL password)
$env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/kitakita_inventory?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC"
$env:SPRING_DATASOURCE_USERNAME="root"
$env:SPRING_DATASOURCE_PASSWORD="your_password"
$env:JWT_SECRET="kitakita-inventory-secret-key-change-in-production-minimum-256-bits"
$env:JWT_EXPIRATION="86400000"

# Start the server
.\mvnw.cmd spring-boot:run
```

## Step 3: Wait for Server to Start

You should see output like:
```
Started KitaKitaInventoryApplication in X.XXX seconds
```

The server is running when you see this message.

## Step 4: Test the Connection

Open your browser and go to:
- `http://localhost:8080/api/auth/login`

You should see an error response (not "connection refused"), which means the server is running.

## Troubleshooting

### "MySQL connection refused"
- Make sure MySQL is running
- Check your MySQL password is correct
- Verify MySQL is on port 3306

### "Port 8080 already in use"
- Another application is using port 8080
- Stop that application or change the port in `application.properties`

### "JWT_SECRET not set"
- Make sure environment variables are set before running `mvnw.cmd`

