# KitaKita Inventory System Setup Summary

## What's Been Done

1. **Backend Configuration:**
   - Created `application.properties` from the example template
   - Created `start-backend.bat` from the example template
   - Configured database credentials (username: root, password: password)
   - Set up JWT secret for authentication

2. **Frontend Setup:**
   - Installed all required npm dependencies
   - Created `.env` file with backend API URL

## Next Steps

### Step 1: Install MySQL Database
Before starting the backend server, you need to have MySQL installed:

1. Follow the instructions in `MYSQL_SETUP_INSTRUCTIONS.md`
2. Choose either MySQL Community Server or XAMPP (easier for beginners)
3. During installation, set a password for the root user
4. Verify MySQL is running by opening a command prompt and typing:
   ```
   mysql -u root -p
   ```

### Step 2: Update Database Credentials
After installing MySQL:

1. Open `inventory-management/start-backend.bat`
2. Update the line `set SPRING_DATASOURCE_PASSWORD=password` with your actual MySQL root password
3. Save the file

### Step 3: Start the Backend Server
Double-click on `inventory-management/start-backend.bat` or run it from the command line:
```
cd inventory-management
start-backend.bat
```

Wait for the message: "Started KitaKitaInventoryApplication in X.XXX seconds"

### Step 4: Start the Frontend Application
Open a new command prompt window and run:
```
cd kitakita-app
npm start
```

The browser should automatically open to `http://localhost:3000`

## Troubleshooting

If you encounter issues:

1. **Backend won't start:**
   - Check that MySQL is running
   - Verify database credentials in `start-backend.bat`
   - Check that port 8080 is not being used by another application

2. **Frontend won't connect to backend:**
   - Ensure the backend is running on `http://localhost:8080`
   - Check the `.env` file in `kitakita-app` directory
   - Look for CORS errors in the browser console

3. **Database connection errors:**
   - Verify MySQL service is running
   - Check that the database user has proper permissions
   - Ensure the database URL in `application.properties` is correct

## Default Login Credentials

Once everything is running, you can register a new user through the signup page, or create one directly in the database.

The application uses JWT tokens for authentication, so after login, you'll be able to access all features.