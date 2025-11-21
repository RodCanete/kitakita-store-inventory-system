# Connecting Frontend to Backend

This guide explains how to connect the React frontend to the Spring Boot backend.

## Prerequisites

1. **Backend must be running** on `http://localhost:8080` (default Spring Boot port)
2. **Database must be configured** in the backend's `application.properties`
3. **CORS is enabled** in the backend (already configured in `SecurityConfig.java`)

## Configuration

### Option 1: Using Environment Variables (Recommended)

Create a `.env` file in the `kitakita-app` directory:

```env
REACT_APP_API_URL=http://localhost:8080
```

If your backend runs on a different port, update the URL accordingly.

### Option 2: Default Configuration

If no `.env` file is present, the app defaults to `http://localhost:8080`.

## Backend API Endpoints

The frontend connects to these endpoints:

- **POST** `/api/auth/signup` - User registration
- **POST** `/api/auth/login` - User login
- **GET** `/api/auth/me` - Get current user (requires Bearer token)
- **POST** `/api/auth/logout` - User logout

## Request/Response Format

### Login Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Login Response
```json
{
  "token": "jwt_token_here",
  "type": "Bearer",
  "userId": 1,
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "ROLE_USER",
  "createdAt": "2024-01-01T00:00:00",
  "lastLogin": "2024-01-15T10:30:00"
}
```

### Signup Request
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

### Signup Response
Same format as Login Response.

## Testing the Connection

1. **Start the backend:**
   ```bash
   cd inventory-management
   ./mvnw spring-boot:run
   # or
   mvn spring-boot:run
   ```

2. **Start the frontend:**
   ```bash
   cd kitakita-app
   npm start
   ```

3. **Test login:**
   - Go to `http://localhost:3000`
   - Use credentials from your database
   - If you don't have a user, use the Signup form first

## Troubleshooting

### CORS Errors
- Ensure the backend `SecurityConfig.java` has CORS enabled (already configured)
- Check that the backend is running on the expected port

### Connection Refused
- Verify the backend is running: `http://localhost:8080/api/auth/login`
- Check the `REACT_APP_API_URL` in your `.env` file
- Ensure no firewall is blocking the connection

### Authentication Errors
- Verify the user exists in the database
- Check password is correct
- Ensure JWT secret is configured in backend `application.properties`

### Token Issues
- Tokens are stored in `localStorage` as `kitakita_token`
- Clear browser localStorage if experiencing token issues
- Check browser console for detailed error messages

## Environment Variables

The frontend uses `REACT_APP_API_URL` to determine the backend URL. This must be set before building for production:

```bash
REACT_APP_API_URL=https://your-backend-url.com npm run build
```

