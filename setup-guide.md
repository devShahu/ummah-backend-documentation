# Super Chat Backend Setup Guide

This guide provides detailed instructions for setting up and running the Super Chat backend server.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **PostgreSQL** (v12 or higher)
- **Git** (optional, for version control)

## Installation Steps

### 1. Clone or Download the Repository

If you received the project as a ZIP file, extract it to your desired location. If you're using Git, clone the repository:

```bash
git clone https://github.com/your-username/super-chat-backend.git
cd super-chat-backend
```

### 2. Install Dependencies

Install all required dependencies using npm:

```bash
npm install
```

### 3. Set Up the Database

#### 3.1. Create a PostgreSQL Database

Create a new PostgreSQL database for the application:

```bash
psql -U postgres
```

In the PostgreSQL shell, run:

```sql
CREATE DATABASE superchat;
```

#### 3.2. Set Up the Database Schema

Run the schema SQL file to create all necessary tables:

```bash
psql -U postgres -d superchat -f database/schema.sql
```

### 4. Configure Environment Variables

#### 4.1. Create Environment File

Create a `.env` file in the root directory of the project by copying the example file:

```bash
cp .env.example .env
```

#### 4.2. Update Environment Variables

Open the `.env` file in a text editor and update the following variables with your specific configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=superchat
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d

# SMS.net.bd API Configuration
SMS_API_KEY=your_sms_api_key
SMS_SENDER_ID=your_sender_id

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=5
OTP_RATE_LIMIT_MINUTES=15
OTP_MAX_ATTEMPTS=3

# Security Configuration
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Logging Configuration
LOG_LEVEL=info

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin_password
```

Make sure to replace placeholder values with your actual configuration:

- `DB_PASSWORD`: Your PostgreSQL database password
- `JWT_SECRET`: A secure random string for JWT token signing
- `SMS_API_KEY`: Your SMS.net.bd API key
- `SMS_SENDER_ID`: Your SMS.net.bd sender ID
- `ADMIN_PASSWORD`: A secure password for the admin account

### 5. Running the Application

#### 5.1. Development Mode

To run the application in development mode with automatic reloading:

```bash
npm run dev
```

#### 5.2. Production Mode

To run the application in production mode:

```bash
npm start
```

### 6. Verify Installation

Once the server is running, you can verify the installation by accessing the health check endpoint:

```
http://localhost:3000/api/health
```

You should receive a response like:

```json
{
  "error": false,
  "message": "Server is running",
  "data": {
    "uptime": "0h 0m 5s",
    "timestamp": "2023-01-01T00:00:05.000Z"
  }
}
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify that PostgreSQL is running
2. Check that the database credentials in your `.env` file are correct
3. Ensure the database exists and has been properly initialized with the schema

### Port Already in Use

If port 3000 is already in use, you can change the port in the `.env` file:

```env
PORT=3001
```

### SMS API Issues

If SMS functionality is not working:

1. Verify that your SMS.net.bd API key and sender ID are correct
2. Check that your SMS.net.bd account has sufficient balance
3. Ensure your account is properly configured for the countries you're sending SMS to

## Security Considerations

### Production Deployment

When deploying to production, consider the following security measures:

1. Use HTTPS with a valid SSL certificate
2. Set a more restrictive CORS policy in the `.env` file
3. Use a strong, unique JWT secret
4. Set up proper firewall rules to restrict access to the server
5. Use a reverse proxy like Nginx for additional security

### Environment Variables

Never commit your `.env` file to version control. It contains sensitive information that should be kept private.

## Additional Resources

- [API Documentation](./api-documentation.md)
- [Database Schema](../database/schema.sql)
- [Postman Collection](./superchat-api-collection.json)
- [OpenAPI Specification](./openapi.yaml)

## Support

If you encounter any issues or have questions, please contact support at support@superchat.com.