# API Integration Guide

This guide provides information on how to integrate with the Super Chat API, including access to API documentation, testing tools, and best practices.

## Table of Contents

1. [API Documentation](#api-documentation)
2. [Postman Collection](#postman-collection)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Best Practices](#best-practices)

## API Documentation

The Super Chat API is documented using the OpenAPI specification. You can access the documentation in the following ways:

### Swagger UI

The Swagger UI provides an interactive interface to explore and test the API endpoints.

- **URL**: [http://your-server-ip:3000/docs/swagger-ui.html](http://your-server-ip:3000/docs/swagger-ui.html)

To access the Swagger UI:
1. Start the Super Chat backend server
2. Open your browser and navigate to the URL above
3. Replace `your-server-ip` with your actual server IP or domain name

### OpenAPI Specification

The raw OpenAPI specification is available in YAML format:

- **URL**: [http://your-server-ip:3000/docs/openapi.yaml](http://your-server-ip:3000/docs/openapi.yaml)

You can use this specification to generate client libraries for various programming languages using tools like [OpenAPI Generator](https://openapi-generator.tech/).

## Postman Collection

A Postman collection is available for testing the API endpoints. This collection includes pre-configured requests for all available endpoints.

### Accessing the Postman Collection

1. Join the Super Chat API team on Postman using this invite link:
   [https://app.getpostman.com/join-team?invite_code=59a8683e2202ccfd347423701c779b64a8187c4d000cb4ca5e9f9a7c12b0cfc4&target_code=620c0d2c8d7ed99fb987fa931020702a](https://app.getpostman.com/join-team?invite_code=59a8683e2202ccfd347423701c779b64a8187c4d000cb4ca5e9f9a7c12b0cfc4&target_code=620c0d2c8d7ed99fb987fa931020702a)

2. Once you've joined the team, you'll have access to the Super Chat API collection.

3. Set up your environment variables:
   - `baseUrl`: Your API base URL (e.g., `http://your-server-ip:3000/api`)
   - `authToken`: Your authentication token (obtained after login)

## Authentication

The Super Chat API uses JWT (JSON Web Tokens) for authentication.

### Obtaining a Token

1. Make a POST request to `/api/auth/login` (for admin) or `/api/auth/verify-otp` (for users) with valid credentials.
2. The response will include a `token` field containing your JWT.
3. Include this token in the `Authorization` header of subsequent requests using the format: `Bearer YOUR_TOKEN`.

### Token Expiration

Tokens expire after 24 hours. When a token expires, you'll need to obtain a new one by logging in again.

## API Endpoints

The Super Chat API is organized into the following categories:

### Authentication

- `POST /api/auth/send-otp`: Send OTP to a phone number
- `POST /api/auth/verify-otp`: Verify OTP and get authentication token
- `POST /api/auth/logout`: Logout and invalidate token

### Users

- `GET /api/users`: Get user profile
- `PUT /api/users/profile`: Update user profile
- `PUT /api/users/notification-token`: Update FCM token
- `POST /api/users/block`: Block a user
- `POST /api/users/unblock`: Unblock a user
- `POST /api/users/report`: Report a user

### Groups

- `POST /api/groups`: Create a new group
- `GET /api/groups/user`: Get groups for current user
- `GET /api/groups/:id`: Get group details
- `PUT /api/groups/:id`: Update group details
- `POST /api/groups/members`: Add member to group
- `DELETE /api/groups/members`: Remove member from group
- `PUT /api/groups/admin`: Update group admin status
- `POST /api/groups/report`: Report a group

### Messages

- `POST /api/messages`: Send a message
- `GET /api/messages`: Get messages for a chat
- `DELETE /api/messages/:id`: Delete a message

### Admin

- `POST /api/admin/login`: Admin login
- `GET /api/admin/stats`: Get dashboard statistics
- `GET /api/admin/users`: Get all users
- `PUT /api/admin/users/:id`: Update user status
- `GET /api/admin/groups`: Get all groups
- `PUT /api/admin/groups/:id`: Update group status
- `GET /api/admin/reported-users`: Get reported users
- `GET /api/admin/reported-groups`: Get reported groups
- `GET /api/admin/settings`: Get app settings
- `PUT /api/admin/settings`: Update app settings

## Best Practices

### Rate Limiting

The API implements rate limiting to prevent abuse. Clients are limited to 100 requests per minute. If you exceed this limit, you'll receive a 429 (Too Many Requests) response.

### Error Handling

The API returns standard HTTP status codes:

- 200: Success
- 400: Bad Request (invalid input)
- 401: Unauthorized (invalid or missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error

Error responses include a JSON body with `error` and `message` fields:

```json
{
  "error": true,
  "message": "Detailed error message"
}
```

### Pagination

Endpoints that return lists of items support pagination using the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Paginated responses include metadata:

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### Filtering

Some endpoints support filtering using query parameters. Refer to the specific endpoint documentation in the Swagger UI for available filters.

### Versioning

The API version is included in the URL path (e.g., `/api/v1/users`). The current version is v1.

### CORS

The API supports Cross-Origin Resource Sharing (CORS) for all origins by default. This can be restricted in production by configuring the allowed origins in the server settings.

### Compression

The API supports gzip compression to reduce response size. To enable compression, include the `Accept-Encoding: gzip` header in your requests.

### Caching

The API uses ETags for caching. Clients can include the `If-None-Match` header with the ETag value from a previous response. If the resource hasn't changed, the server will respond with a 304 (Not Modified) status code.

### Security

- Always use HTTPS in production
- Keep your authentication tokens secure
- Implement proper token storage and refresh mechanisms in your client applications
- Validate all user inputs before sending to the API
- Handle sensitive data according to relevant privacy regulations