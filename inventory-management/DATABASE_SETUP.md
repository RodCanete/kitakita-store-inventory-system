# Database Setup Guide

## Understanding the Data Source URL

The data source URL tells Spring Boot how to connect to your MySQL database.

## URL Format

```
jdbc:mysql://HOST:PORT/DATABASE_NAME?PARAMETERS
```

## Standard Configuration

For a local MySQL installation, use:

```
jdbc:mysql://localhost:3306/kitakita_inventory?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
```

### Breaking it down:

- **`jdbc:mysql://`** - Protocol for MySQL
- **`localhost`** - Database host (use `localhost` for local MySQL)
- **`:3306`** - MySQL port (default is 3306)
- **`/kitakita_inventory`** - Database name (will be created if it doesn't exist)
- **`?createDatabaseIfNotExist=true`** - Automatically creates the database if it doesn't exist
- **`&useSSL=false`** - Disables SSL (for local development)
- **`&serverTimezone=UTC`** - Sets timezone to avoid timezone issues

## How to Find Your Database Information

### 1. Check MySQL Port

**Windows:**
- Open Command Prompt
- Run: `netstat -an | findstr 3306`
- If you see `0.0.0.0:3306`, MySQL is running on port 3306

**Or check MySQL configuration:**
- Look in `C:\ProgramData\MySQL\MySQL Server X.X\my.ini`
- Find `port=3306` (or whatever port is set)

### 2. Check MySQL Host

- **Local MySQL**: Use `localhost` or `127.0.0.1`
- **Remote MySQL**: Use the server's IP address or hostname

### 3. Database Name

You can use any name you want. Common options:
- `kitakita_inventory`
- `kitakita_db`
- `inventory_db`

The `createDatabaseIfNotExist=true` parameter will create it automatically.

## Common URL Examples

### Local MySQL (Default)
```
jdbc:mysql://localhost:3306/kitakita_inventory?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
```

### MySQL on Different Port
If MySQL is on port 3307:
```
jdbc:mysql://localhost:3307/kitakita_inventory?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
```

### Remote MySQL Server
If MySQL is on another machine (IP: 192.168.1.100):
```
jdbc:mysql://192.168.1.100:3306/kitakita_inventory?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
```

### MySQL with SSL (Production)
```
jdbc:mysql://localhost:3306/kitakita_inventory?createDatabaseIfNotExist=true&useSSL=true&serverTimezone=UTC
```

## Quick Setup Steps

1. **Make sure MySQL is installed and running**
   - Check Windows Services for "MySQL" service
   - Or run: `mysql -u root -p` in command prompt

2. **Use the default URL** (recommended for first-time setup):
   ```
   jdbc:mysql://localhost:3306/kitakita_inventory?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
   ```

3. **Set your MySQL username and password:**
   - Username: Usually `root` for local development
   - Password: Your MySQL root password (the one you set during installation)

## Testing the Connection

You can test if the URL works by:

1. **Using MySQL Command Line:**
   ```cmd
   mysql -u root -p
   ```
   Then try to connect to the database:
   ```sql
   USE kitakita_inventory;
   ```

2. **Or let Spring Boot create it:**
   - With `createDatabaseIfNotExist=true`, Spring Boot will create the database automatically
   - Just make sure your MySQL user has permission to create databases

## Troubleshooting

### "Access denied for user"
- Check your MySQL username and password
- Make sure the user has CREATE DATABASE permission

### "Connection refused"
- MySQL is not running
- Wrong port number
- Firewall blocking the connection

### "Unknown database"
- Remove `createDatabaseIfNotExist=true` and create the database manually
- Or check if your MySQL user has CREATE permission

## For Your start-backend.bat File

Just use this (it's already in the file):
```
set SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/kitakita_inventory?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
```

You only need to change it if:
- MySQL is on a different port (not 3306)
- MySQL is on a different machine
- You want a different database name

