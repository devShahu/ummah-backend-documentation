# Super Chat API Documentation

## Overview

This document provides comprehensive documentation for the Super Chat API, which powers the backend of the Super Chat Android application. The API is built using Node.js, Express, and PostgreSQL.

## Base URL

```
http://your-server-address:3000/api
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. Most endpoints require a valid JWT token to be included in the request header.

### Authentication Header

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow a standard format:

### Success Response

```json
{
  "error": false,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "error": true,
  "message": "Error description"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. By default, each IP address is limited to 100 requests per 15 minutes.

## API Endpoints

### Authentication

#### Send OTP

- **URL**: `/auth/send-otp`
- **Method**: `POST`
- **Authentication**: None
- **Description**: Sends an OTP (One-Time Password) to the provided phone number for authentication.
- **Request Body**:

```json
{
  "phone_number": "+1234567890"
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "OTP sent successfully",
  "data": {
    "phone_number": "+1234567890",
    "expires_in": 300
  }
}
```

#### Verify OTP

- **URL**: `/auth/verify-otp`
- **Method**: `POST`
- **Authentication**: None
- **Description**: Verifies the OTP sent to the user's phone number and returns a JWT token upon successful verification.
- **Request Body**:

```json
{
  "phone_number": "+1234567890",
  "otp_code": "123456"
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "OTP verified successfully",
  "data": {
    "token": "your_jwt_token",
    "user": {
      "id": "user_uuid",
      "phone_number": "+1234567890",
      "name": "User Name",
      "email": "user@example.com",
      "photo": "photo_url",
      "status": "Hey there! I'm using Super Chat",
      "verified": true,
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### Logout

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Invalidates the current JWT token.
- **Success Response**:

```json
{
  "error": false,
  "message": "Logged out successfully"
}
```

#### Get Profile

- **URL**: `/auth/profile`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Retrieves the authenticated user's profile information.
- **Success Response**:

```json
{
  "error": false,
  "data": {
    "id": "user_uuid",
    "phone_number": "+1234567890",
    "name": "User Name",
    "email": "user@example.com",
    "photo": "photo_url",
    "status": "Hey there! I'm using Super Chat",
    "verified": true,
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Update Profile

- **URL**: `/auth/profile`
- **Method**: `PUT`
- **Authentication**: Required
- **Description**: Updates the authenticated user's profile information.
- **Request Body**:

```json
{
  "name": "New Name",
  "email": "new_email@example.com",
  "photo": "new_photo_url",
  "status": "New status message"
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "Profile updated successfully",
  "data": {
    "id": "user_uuid",
    "phone_number": "+1234567890",
    "name": "New Name",
    "email": "new_email@example.com",
    "photo": "new_photo_url",
    "status": "New status message",
    "verified": true,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-02T00:00:00.000Z"
  }
}
```

#### Register Notification Token

- **URL**: `/auth/notification-token`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Registers a device token for push notifications.
- **Request Body**:

```json
{
  "token": "device_token",
  "device_id": "device_id"
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "Notification token registered successfully"
}
```

#### Unregister Notification Token

- **URL**: `/auth/notification-token`
- **Method**: `DELETE`
- **Authentication**: Required
- **Description**: Unregisters a device token for push notifications.
- **Request Body**:

```json
{
  "token": "device_token"
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "Notification token unregistered successfully"
}
```

### Users

#### Get All Users

- **URL**: `/users`
- **Method**: `GET`
- **Authentication**: Required (Admin only)
- **Description**: Retrieves a list of all users with pagination.
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of users per page (default: 20)
  - `search`: Search term for name or phone number
- **Success Response**:

```json
{
  "error": false,
  "data": {
    "users": [
      {
        "id": "user_uuid",
        "phone_number": "+1234567890",
        "name": "User Name",
        "email": "user@example.com",
        "photo": "photo_url",
        "status": "Hey there! I'm using Super Chat",
        "verified": true,
        "disabled": false,
        "created_at": "2023-01-01T00:00:00.000Z"
      },
      // More users...
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "pages": 5
    }
  }
}
```

#### Get User by ID

- **URL**: `/users/:id`
- **Method**: `GET`
- **Authentication**: Required (Self or Admin)
- **Description**: Retrieves a specific user's information.
- **Success Response**:

```json
{
  "error": false,
  "data": {
    "id": "user_uuid",
    "phone_number": "+1234567890",
    "name": "User Name",
    "email": "user@example.com",
    "photo": "photo_url",
    "status": "Hey there! I'm using Super Chat",
    "verified": true,
    "disabled": false,
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Update User

- **URL**: `/users/:id`
- **Method**: `PUT`
- **Authentication**: Required (Self or Admin)
- **Description**: Updates a specific user's information.
- **Request Body**:

```json
{
  "name": "New Name",
  "email": "new_email@example.com",
  "photo": "new_photo_url",
  "status": "New status message"
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "User updated successfully",
  "data": {
    "id": "user_uuid",
    "phone_number": "+1234567890",
    "name": "New Name",
    "email": "new_email@example.com",
    "photo": "new_photo_url",
    "status": "New status message",
    "verified": true,
    "disabled": false,
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-02T00:00:00.000Z"
  }
}
```

#### Update Verification Status

- **URL**: `/users/:id/verify`
- **Method**: `PUT`
- **Authentication**: Required (Admin only)
- **Description**: Updates a user's verification status.
- **Request Body**:

```json
{
  "verified": true
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "User verification status updated successfully"
}
```

#### Update Disabled Status

- **URL**: `/users/:id/disable`
- **Method**: `PUT`
- **Authentication**: Required (Admin only)
- **Description**: Updates a user's disabled status.
- **Request Body**:

```json
{
  "disabled": true
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "User disabled status updated successfully"
}
```

#### Delete User

- **URL**: `/users/:id`
- **Method**: `DELETE`
- **Authentication**: Required (Admin only)
- **Description**: Deletes a user account.
- **Success Response**:

```json
{
  "error": false,
  "message": "User deleted successfully"
}
```

#### Report User

- **URL**: `/users/:id/report`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Reports a user for inappropriate behavior.
- **Request Body**:

```json
{
  "reason": "Reason for reporting"
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "User reported successfully"
}
```

#### Block User

- **URL**: `/users/:id/block`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Blocks a user.
- **Success Response**:

```json
{
  "error": false,
  "message": "User blocked successfully"
}
```

#### Unblock User

- **URL**: `/users/:id/block`
- **Method**: `DELETE`
- **Authentication**: Required
- **Description**: Unblocks a user.
- **Success Response**:

```json
{
  "error": false,
  "message": "User unblocked successfully"
}
```

#### Get Blocked Users

- **URL**: `/users/me/blocked`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Retrieves a list of users blocked by the authenticated user.
- **Success Response**:

```json
{
  "error": false,
  "data": [
    {
      "id": "user_uuid",
      "phone_number": "+1234567890",
      "name": "User Name",
      "photo": "photo_url",
      "blocked_at": "2023-01-01T00:00:00.000Z"
    },
    // More blocked users...
  ]
}
```

### Groups

#### Create Group

- **URL**: `/groups`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Creates a new group.
- **Request Body**:

```json
{
  "name": "Group Name",
  "photo": "group_photo_url",
  "only_admins_can_post": false,
  "members": ["user_uuid1", "user_uuid2"]
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "Group created successfully",
  "data": {
    "id": "group_uuid",
    "name": "Group Name",
    "photo": "group_photo_url",
    "only_admins_can_post": false,
    "created_by": "user_uuid",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Get All Groups

- **URL**: `/groups/all`
- **Method**: `GET`
- **Authentication**: Required (Admin only)
- **Description**: Retrieves a list of all groups with pagination.
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of groups per page (default: 20)
  - `search`: Search term for group name
- **Success Response**:

```json
{
  "error": false,
  "data": {
    "groups": [
      {
        "id": "group_uuid",
        "name": "Group Name",
        "photo": "group_photo_url",
        "only_admins_can_post": false,
        "disabled": false,
        "created_by": "user_uuid",
        "created_at": "2023-01-01T00:00:00.000Z",
        "member_count": 10
      },
      // More groups...
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

#### Get Groups by User ID

- **URL**: `/groups`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Retrieves a list of groups that the authenticated user is a member of.
- **Success Response**:

```json
{
  "error": false,
  "data": [
    {
      "id": "group_uuid",
      "name": "Group Name",
      "photo": "group_photo_url",
      "only_admins_can_post": false,
      "created_by": "user_uuid",
      "created_at": "2023-01-01T00:00:00.000Z",
      "is_admin": true,
      "member_count": 10
    },
    // More groups...
  ]
}
```

#### Get Group by ID

- **URL**: `/groups/:id`
- **Method**: `GET`
- **Authentication**: Required
- **Description**: Retrieves a specific group's information.
- **Success Response**:

```json
{
  "error": false,
  "data": {
    "group": {
      "id": "group_uuid",
      "name": "Group Name",
      "photo": "group_photo_url",
      "only_admins_can_post": false,
      "created_by": "user_uuid",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    },
    "members": [
      {
        "id": "user_uuid",
        "name": "User Name",
        "phone_number": "+1234567890",
        "photo": "photo_url",
        "is_admin": true,
        "joined_at": "2023-01-01T00:00:00.000Z"
      },
      // More members...
    ]
  }
}
```

#### Update Group

- **URL**: `/groups/:id`
- **Method**: `PUT`
- **Authentication**: Required
- **Description**: Updates a group's information.
- **Request Body**:

```json
{
  "name": "New Group Name",
  "photo": "new_group_photo_url",
  "only_admins_can_post": true
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "Group updated successfully",
  "data": {
    "id": "group_uuid",
    "name": "New Group Name",
    "photo": "new_group_photo_url",
    "only_admins_can_post": true,
    "created_by": "user_uuid",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-02T00:00:00.000Z"
  }
}
```

#### Update Group Disabled Status

- **URL**: `/groups/:id/disable`
- **Method**: `PUT`
- **Authentication**: Required (Admin only)
- **Description**: Updates a group's disabled status.
- **Request Body**:

```json
{
  "disabled": true
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "Group disabled status updated successfully"
}
```

#### Delete Group

- **URL**: `/groups/:id`
- **Method**: `DELETE`
- **Authentication**: Required (Admin only)
- **Description**: Deletes a group.
- **Success Response**:

```json
{
  "error": false,
  "message": "Group deleted successfully"
}
```

#### Add Member to Group

- **URL**: `/groups/:id/members`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Adds a user to a group.
- **Request Body**:

```json
{
  "user_id": "user_uuid",
  "is_admin": false
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "Member added successfully"
}
```

#### Remove Member from Group

- **URL**: `/groups/:id/members`
- **Method**: `DELETE`
- **Authentication**: Required
- **Description**: Removes a user from a group.
- **Request Body**:

```json
{
  "user_id": "user_uuid"
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "Member removed successfully"
}
```

#### Update Member Admin Status

- **URL**: `/groups/:id/members`
- **Method**: `PUT`
- **Authentication**: Required
- **Description**: Updates a group member's admin status.
- **Request Body**:

```json
{
  "user_id": "user_uuid",
  "is_admin": true
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "Member admin status updated successfully"
}
```

#### Report Group

- **URL**: `/groups/:id/report`
- **Method**: `POST`
- **Authentication**: Required
- **Description**: Reports a group for inappropriate content or behavior.
- **Request Body**:

```json
{
  "reason": "Reason for reporting"
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "Group reported successfully"
}
```

### Admin

#### Admin Login

- **URL**: `/admin/login`
- **Method**: `POST`
- **Authentication**: None
- **Description**: Authenticates an admin user and returns a JWT token.
- **Request Body**:

```json
{
  "username": "admin_username",
  "password": "admin_password"
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "Login successful",
  "data": {
    "token": "admin_jwt_token",
    "admin": {
      "id": "admin_uuid",
      "username": "admin_username",
      "email": "admin@example.com"
    }
  }
}
```

#### Get System Statistics

- **URL**: `/admin/stats`
- **Method**: `GET`
- **Authentication**: Required (Admin only)
- **Description**: Retrieves system statistics.
- **Success Response**:

```json
{
  "error": false,
  "data": {
    "total_users": 1000,
    "active_users": 800,
    "total_groups": 150,
    "total_otps_sent": 5000,
    "total_sms_sent": 5000,
    "reported_users": 10,
    "reported_groups": 5
  }
}
```

#### Get App Settings

- **URL**: `/admin/settings`
- **Method**: `GET`
- **Authentication**: Required (Admin only)
- **Description**: Retrieves application settings.
- **Success Response**:

```json
{
  "error": false,
  "data": {
    "allow_creating_broadcast": true,
    "allow_creating_groups": true,
    "allow_creating_status": true,
    "allow_calls": true,
    "allow_send_attachment": true,
    "allow_user_signup": true,
    "maintenance_mode": false,
    "otp_expiry_minutes": 5,
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

#### Update App Settings

- **URL**: `/admin/settings`
- **Method**: `PUT`
- **Authentication**: Required (Admin only)
- **Description**: Updates application settings.
- **Request Body**:

```json
{
  "allow_creating_broadcast": true,
  "allow_creating_groups": true,
  "allow_creating_status": true,
  "allow_calls": true,
  "allow_send_attachment": true,
  "allow_user_signup": true,
  "maintenance_mode": false,
  "otp_expiry_minutes": 10
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "Settings updated successfully",
  "data": {
    "allow_creating_broadcast": true,
    "allow_creating_groups": true,
    "allow_creating_status": true,
    "allow_calls": true,
    "allow_send_attachment": true,
    "allow_user_signup": true,
    "maintenance_mode": false,
    "otp_expiry_minutes": 10,
    "updated_at": "2023-01-02T00:00:00.000Z"
  }
}
```

#### Get Reported Users

- **URL**: `/admin/reported-users`
- **Method**: `GET`
- **Authentication**: Required (Admin only)
- **Description**: Retrieves a list of reported users with pagination.
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of reports per page (default: 20)
- **Success Response**:

```json
{
  "error": false,
  "data": {
    "reports": [
      {
        "id": "report_uuid",
        "reporter": {
          "id": "user_uuid",
          "name": "Reporter Name",
          "phone_number": "+1234567890"
        },
        "reported_user": {
          "id": "user_uuid",
          "name": "Reported User Name",
          "phone_number": "+0987654321",
          "disabled": false
        },
        "reason": "Reason for reporting",
        "created_at": "2023-01-01T00:00:00.000Z"
      },
      // More reports...
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

#### Get Reported Groups

- **URL**: `/admin/reported-groups`
- **Method**: `GET`
- **Authentication**: Required (Admin only)
- **Description**: Retrieves a list of reported groups with pagination.
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of reports per page (default: 20)
- **Success Response**:

```json
{
  "error": false,
  "data": {
    "reports": [
      {
        "id": "report_uuid",
        "reporter": {
          "id": "user_uuid",
          "name": "Reporter Name",
          "phone_number": "+1234567890"
        },
        "reported_group": {
          "id": "group_uuid",
          "name": "Reported Group Name",
          "disabled": false
        },
        "reason": "Reason for reporting",
        "created_at": "2023-01-01T00:00:00.000Z"
      },
      // More reports...
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 20,
      "pages": 1
    }
  }
}
```

#### Create Admin

- **URL**: `/admin/create`
- **Method**: `POST`
- **Authentication**: Required (Admin only)
- **Description**: Creates a new admin user.
- **Request Body**:

```json
{
  "username": "new_admin",
  "email": "new_admin@example.com",
  "password": "admin_password"
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "Admin created successfully",
  "data": {
    "id": "admin_uuid",
    "username": "new_admin",
    "email": "new_admin@example.com",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

### SMS

#### Get SMS Logs

- **URL**: `/sms/logs`
- **Method**: `GET`
- **Authentication**: Required (Admin only)
- **Description**: Retrieves SMS logs with pagination.
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of logs per page (default: 20)
  - `phone_number`: Filter by phone number
- **Success Response**:

```json
{
  "error": false,
  "data": {
    "logs": [
      {
        "id": "log_uuid",
        "phone_number": "+1234567890",
        "message": "Your OTP is 123456",
        "request_id": "sms_request_id",
        "status": "delivered",
        "created_at": "2023-01-01T00:00:00.000Z"
      },
      // More logs...
    ],
    "pagination": {
      "total": 5000,
      "page": 1,
      "limit": 20,
      "pages": 250
    }
  }
}
```

#### Get SMS Balance

- **URL**: `/sms/balance`
- **Method**: `GET`
- **Authentication**: Required (Admin only)
- **Description**: Retrieves the current SMS balance from the SMS provider.
- **Success Response**:

```json
{
  "error": false,
  "data": {
    "balance": 1000,
    "currency": "BDT"
  }
}
```

#### Send Custom SMS

- **URL**: `/sms/send`
- **Method**: `POST`
- **Authentication**: Required (Admin only)
- **Description**: Sends a custom SMS message.
- **Request Body**:

```json
{
  "phone_number": "+1234567890",
  "message": "Custom SMS message"
}
```

- **Success Response**:

```json
{
  "error": false,
  "message": "SMS sent successfully",
  "data": {
    "request_id": "sms_request_id"
  }
}
```

#### Get SMS Status

- **URL**: `/sms/status/:request_id`
- **Method**: `GET`
- **Authentication**: None
- **Description**: Retrieves the delivery status of an SMS message.
- **Success Response**:

```json
{
  "error": false,
  "data": {
    "phone_number": "+1234567890",
    "status": "delivered",
    "created_at": "2023-01-01T00:00:00.000Z"
  }
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - The request was malformed or contains invalid parameters |
| 401 | Unauthorized - Authentication is required or has failed |
| 403 | Forbidden - The authenticated user does not have permission to access the requested resource |
| 404 | Not Found - The requested resource was not found |
| 409 | Conflict - The request could not be completed due to a conflict with the current state of the resource |
| 429 | Too Many Requests - The user has sent too many requests in a given amount of time |
| 500 | Internal Server Error - An unexpected error occurred on the server |

## Postman Collection

A Postman collection is available for testing the API. You can import it using the following link:

```
https://www.postman.com/collections/your-collection-id
```

## OpenAPI Specification

The OpenAPI specification for this API is available at:

```
http://your-server-address:3000/api-docs
```