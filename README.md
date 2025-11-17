# KitaKita Inventory System

Full-stack inventory management platform composed of a Spring Boot REST API (`inventory-management/`) and a React web client (`kitakita-app/`). This monorepo lets you develop, test, and deploy both services together.

## Project Structure

- `inventory-management/` – Spring Boot 3.5 API with JWT auth, MySQL persistence, and Maven wrapper scripts.
- `kitakita-app/` – React client bootstrapped with Create React App.
- `.gitignore` – filters build artifacts, IDE files, and secrets (extend as the project grows).

## Prerequisites

- Java 17+
- Maven 3.9+ (or the bundled `mvnw` scripts)
- Node.js 18+ and npm 9+
- MySQL 8 (or compatible server)

## Getting Started

1. **Clone & install**

   ```bash
   git clone <repo-url>
   cd KitaKita\ Inventory\ System
   ```

2. **Backend setup**

   - Copy the sample config and fill in real credentials:

     ```bash
     cd inventory-management
     cp src/main/resources/application.properties.example src/main/resources/application.properties
     ```

   - Update DB URL/user/pass and `jwt.secret`. Rotate any credentials that were previously committed locally.
   - Run the API:

     ```bash
     ./mvnw spring-boot:run
     ```

   - Tests:

     ```bash
     ./mvnw test
     ```

3. **Frontend setup**

   ```bash
   cd kitakita-app
   npm install
   npm start
   ```

   Use `npm test` for unit tests and `npm run build` for production builds.

