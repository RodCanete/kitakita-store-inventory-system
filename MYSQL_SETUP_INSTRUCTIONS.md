# MySQL Setup Instructions for KitaKita Inventory System

## Option 1: Install MySQL Community Server (Recommended)

1. Download MySQL Community Server:
   - Visit https://dev.mysql.com/downloads/mysql/
   - Download the Windows version
   - Run the installer and follow the setup wizard
   - During installation, make sure to:
     - Set a root password (remember this!)
     - Choose "Standalone MySQL Server" 
     - Select "Development Machine" configuration
     - Keep port 3306 (default)

2. After installation, verify MySQL is running:
   - Open Command Prompt
   - Run: `mysql -u root -p`
   - Enter the password you set during installation

## Option 2: Use XAMPP (Easier for beginners)

1. Download XAMPP:
   - Visit https://www.apachefriends.org/download.html
   - Download the Windows version
   - Install XAMPP
   - Launch XAMPP Control Panel
   - Start the MySQL service (click "Start" next to MySQL)

2. Access MySQL:
   - In XAMPP Control Panel, click "Shell" next to MySQL
   - Or open Command Prompt and run: `mysql -u root -p`
   - (By default, XAMPP has no password for root)

## After Installing MySQL

Once MySQL is installed and running:

1. Update your `start-backend.bat` file with your actual MySQL credentials:
   - Edit line: `set SPRING_DATASOURCE_PASSWORD=your_actual_password`
   - If you changed the username from "root", update that too

2. Save the file and double-click `start-backend.bat` to start the backend server

3. You should see output indicating the server is starting successfully

## Troubleshooting

If you get connection errors:
- Make sure MySQL service is running
- Verify your username/password
- Check that MySQL is listening on port 3306
- Ensure no firewall is blocking the connection