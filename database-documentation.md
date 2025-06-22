# Super Chat Database Documentation

This document provides a comprehensive overview of the Super Chat application's database schema, including tables, relationships, and key constraints.

## Database Overview

The Super Chat application uses PostgreSQL as its database management system. The schema is designed to support the following core functionalities:

- User authentication and profile management
- One-time password (OTP) verification
- User sessions and notification tokens
- Group creation and management
- Messaging between users and in groups
- User blocking and reporting
- Administrative functions
- SMS logging and tracking

## Entity Relationship Diagram

```
+---------------+     +---------------+     +---------------+
|     users     |     |     groups    |     |  group_members|
+---------------+     +---------------+     +---------------+
| id            |<----| created_by    |     | id            |
| phone_number  |     | name          |<----| group_id      |
| name          |     | photo         |     | user_id       |
| email         |     | only_admins...|     | is_admin      |
| photo         |     | disabled      |     | joined_at     |
| status        |     | created_at    |     +---------------+
| verified      |     | updated_at    |            ^
| disabled      |     +---------------+            |
| created_at    |            ^                     |
| updated_at    |            |                     |
+---------------+            |                     |
       ^                     |                     |
       |                     |                     |
       |                     |                     |
+------+------+     +-------+-----+     +---------+---+
|    otps     |     |  messages   |     | user_messages|
+-------------+     +-------------+     +-------------+
| id          |     | id          |     | id          |
| user_id     |     | group_id    |     | sender_id   |
| phone_number|     | sender_id   |     | receiver_id |
| otp_code    |     | content     |     | content     |
| expires_at  |     | type        |     | type        |
| verified    |     | created_at  |     | created_at  |
| attempts    |     +-------------+     | read_at     |
| created_at  |                         +-------------+
+-------------+
```

## Table Definitions

### users

Stores user account information.

| Column        | Type          | Constraints       | Description                           |
|---------------|---------------|-------------------|---------------------------------------|
| id            | UUID          | PK, NOT NULL      | Unique identifier for the user        |
| phone_number  | VARCHAR(20)   | UNIQUE, NOT NULL  | User's phone number (for login)       |
| name          | VARCHAR(100)  | NOT NULL          | User's display name                   |
| email         | VARCHAR(100)  | UNIQUE            | User's email address (optional)       |
| photo         | TEXT          |                   | URL to user's profile photo           |
| status        | VARCHAR(255)  |                   | User's status message                 |
| verified      | BOOLEAN       | DEFAULT FALSE     | Whether user is verified              |
| disabled      | BOOLEAN       | DEFAULT FALSE     | Whether account is disabled           |
| created_at    | TIMESTAMP     | DEFAULT NOW()     | When the account was created          |
| updated_at    | TIMESTAMP     | DEFAULT NOW()     | When the account was last updated     |

### otps

Stores one-time passwords sent to users for authentication.

| Column        | Type          | Constraints       | Description                           |
|---------------|---------------|-------------------|---------------------------------------|
| id            | UUID          | PK, NOT NULL      | Unique identifier for the OTP         |
| user_id       | UUID          | FK                | Reference to users.id (if exists)     |
| phone_number  | VARCHAR(20)   | NOT NULL          | Phone number the OTP was sent to      |
| otp_code      | VARCHAR(10)   | NOT NULL          | The OTP code                          |
| expires_at    | TIMESTAMP     | NOT NULL          | When the OTP expires                  |
| verified      | BOOLEAN       | DEFAULT FALSE     | Whether the OTP has been verified     |
| attempts      | INTEGER       | DEFAULT 0         | Number of verification attempts       |
| created_at    | TIMESTAMP     | DEFAULT NOW()     | When the OTP was created              |

### sessions

Stores active user sessions.

| Column        | Type          | Constraints       | Description                           |
|---------------|---------------|-------------------|---------------------------------------|
| id            | UUID          | PK, NOT NULL      | Unique identifier for the session     |
| user_id       | UUID          | FK, NOT NULL      | Reference to users.id                 |
| token         | TEXT          | NOT NULL          | JWT token                             |
| expires_at    | TIMESTAMP     | NOT NULL          | When the session expires              |
| created_at    | TIMESTAMP     | DEFAULT NOW()     | When the session was created          |

### groups

Stores information about chat groups.

| Column               | Type          | Constraints       | Description                           |
|----------------------|---------------|-------------------|---------------------------------------|
| id                   | UUID          | PK, NOT NULL      | Unique identifier for the group       |
| name                 | VARCHAR(100)  | NOT NULL          | Group name                            |
| photo                | TEXT          |                   | URL to group photo                    |
| only_admins_can_post | BOOLEAN       | DEFAULT FALSE     | Whether only admins can post messages |
| created_by           | UUID          | FK, NOT NULL      | Reference to users.id (creator)       |
| disabled             | BOOLEAN       | DEFAULT FALSE     | Whether group is disabled             |
| created_at           | TIMESTAMP     | DEFAULT NOW()     | When the group was created            |
| updated_at           | TIMESTAMP     | DEFAULT NOW()     | When the group was last updated       |

### group_members

Stores group membership information.

| Column        | Type          | Constraints       | Description                           |
|---------------|---------------|-------------------|---------------------------------------|
| id            | UUID          | PK, NOT NULL      | Unique identifier for the membership  |
| group_id      | UUID          | FK, NOT NULL      | Reference to groups.id                |
| user_id       | UUID          | FK, NOT NULL      | Reference to users.id                 |
| is_admin      | BOOLEAN       | DEFAULT FALSE     | Whether user is a group admin         |
| joined_at     | TIMESTAMP     | DEFAULT NOW()     | When user joined the group            |

### messages

Stores messages sent in groups.

| Column        | Type          | Constraints       | Description                           |
|---------------|---------------|-------------------|---------------------------------------|
| id            | UUID          | PK, NOT NULL      | Unique identifier for the message     |
| group_id      | UUID          | FK, NOT NULL      | Reference to groups.id                |
| sender_id     | UUID          | FK, NOT NULL      | Reference to users.id                 |
| content       | TEXT          | NOT NULL          | Message content                       |
| type          | VARCHAR(20)   | DEFAULT 'text'    | Message type (text, image, etc.)      |
| created_at    | TIMESTAMP     | DEFAULT NOW()     | When the message was sent             |

### user_messages

Stores direct messages between users.

| Column        | Type          | Constraints       | Description                           |
|---------------|---------------|-------------------|---------------------------------------|
| id            | UUID          | PK, NOT NULL      | Unique identifier for the message     |
| sender_id     | UUID          | FK, NOT NULL      | Reference to users.id (sender)        |
| receiver_id   | UUID          | FK, NOT NULL      | Reference to users.id (receiver)      |
| content       | TEXT          | NOT NULL          | Message content                       |
| type          | VARCHAR(20)   | DEFAULT 'text'    | Message type (text, image, etc.)      |
| created_at    | TIMESTAMP     | DEFAULT NOW()     | When the message was sent             |
| read_at       | TIMESTAMP     |                   | When the message was read             |

### blocked_users

Stores information about users blocked by other users.

| Column        | Type          | Constraints       | Description                           |
|---------------|---------------|-------------------|---------------------------------------|
| id            | UUID          | PK, NOT NULL      | Unique identifier for the block       |
| user_id       | UUID          | FK, NOT NULL      | Reference to users.id (blocker)       |
| blocked_id    | UUID          | FK, NOT NULL      | Reference to users.id (blocked)       |
| created_at    | TIMESTAMP     | DEFAULT NOW()     | When the block was created            |

### notification_tokens

Stores device tokens for push notifications.

| Column        | Type          | Constraints       | Description                           |
|---------------|---------------|-------------------|---------------------------------------|
| id            | UUID          | PK, NOT NULL      | Unique identifier for the token       |
| user_id       | UUID          | FK, NOT NULL      | Reference to users.id                 |
| token         | TEXT          | NOT NULL          | Device token                          |
| device_id     | VARCHAR(100)  | NOT NULL          | Device identifier                     |
| created_at    | TIMESTAMP     | DEFAULT NOW()     | When the token was registered         |

### reported_users

Stores reports of users for inappropriate behavior.

| Column          | Type          | Constraints       | Description                           |
|-----------------|---------------|-------------------|---------------------------------------|
| id              | UUID          | PK, NOT NULL      | Unique identifier for the report      |
| reporter_id     | UUID          | FK, NOT NULL      | Reference to users.id (reporter)      |
| reported_id     | UUID          | FK, NOT NULL      | Reference to users.id (reported)      |
| reason          | TEXT          | NOT NULL          | Reason for the report                 |
| status          | VARCHAR(20)   | DEFAULT 'pending' | Report status                         |
| created_at      | TIMESTAMP     | DEFAULT NOW()     | When the report was created           |
| resolved_at     | TIMESTAMP     |                   | When the report was resolved          |

### reported_groups

Stores reports of groups for inappropriate content.

| Column          | Type          | Constraints       | Description                           |
|-----------------|---------------|-------------------|---------------------------------------|
| id              | UUID          | PK, NOT NULL      | Unique identifier for the report      |
| reporter_id     | UUID          | FK, NOT NULL      | Reference to users.id (reporter)      |
| group_id        | UUID          | FK, NOT NULL      | Reference to groups.id                |
| reason          | TEXT          | NOT NULL          | Reason for the report                 |
| status          | VARCHAR(20)   | DEFAULT 'pending' | Report status                         |
| created_at      | TIMESTAMP     | DEFAULT NOW()     | When the report was created           |
| resolved_at     | TIMESTAMP     |                   | When the report was resolved          |

### app_settings

Stores application-wide settings.

| Column                  | Type          | Constraints       | Description                           |
|-------------------------|---------------|-------------------|---------------------------------------|
| id                      | INTEGER       | PK, NOT NULL      | Unique identifier for the settings    |
| maintenance_mode        | BOOLEAN       | DEFAULT FALSE     | Whether app is in maintenance mode    |
| allow_user_registration | BOOLEAN       | DEFAULT TRUE      | Whether new users can register        |
| allow_group_creation    | BOOLEAN       | DEFAULT TRUE      | Whether users can create groups       |
| otp_expiry_minutes      | INTEGER       | DEFAULT 5         | OTP expiry time in minutes            |
| updated_at              | TIMESTAMP     | DEFAULT NOW()     | When settings were last updated       |

### sms_logs

Stores logs of SMS messages sent through the system.

| Column        | Type          | Constraints       | Description                           |
|---------------|---------------|-------------------|---------------------------------------|
| id            | UUID          | PK, NOT NULL      | Unique identifier for the log         |
| phone_number  | VARCHAR(20)   | NOT NULL          | Recipient phone number                |
| message       | TEXT          | NOT NULL          | SMS content                           |
| request_id    | VARCHAR(100)  |                   | SMS provider request ID               |
| status        | VARCHAR(20)   | DEFAULT 'pending' | Delivery status                       |
| created_at    | TIMESTAMP     | DEFAULT NOW()     | When the SMS was sent                 |

### admins

Stores admin user accounts.

| Column        | Type          | Constraints       | Description                           |
|---------------|---------------|-------------------|---------------------------------------|
| id            | UUID          | PK, NOT NULL      | Unique identifier for the admin       |
| username      | VARCHAR(50)   | UNIQUE, NOT NULL  | Admin username                        |
| email         | VARCHAR(100)  | UNIQUE, NOT NULL  | Admin email                           |
| password_hash | TEXT          | NOT NULL          | Hashed password                       |
| created_at    | TIMESTAMP     | DEFAULT NOW()     | When the admin was created            |
| updated_at    | TIMESTAMP     | DEFAULT NOW()     | When the admin was last updated       |

## Key Relationships

1. **User Authentication**:
   - `otps` table references `users` through `user_id` (optional, as OTPs can be sent to non-registered users)
   - `sessions` table references `users` through `user_id`

2. **User Interactions**:
   - `blocked_users` table references `users` twice through `user_id` and `blocked_id`
   - `notification_tokens` table references `users` through `user_id`
   - `reported_users` table references `users` twice through `reporter_id` and `reported_id`

3. **Groups**:
   - `groups` table references `users` through `created_by`
   - `group_members` table references both `groups` and `users`
   - `messages` table references both `groups` and `users`
   - `reported_groups` table references both `groups` and `users`

4. **Messaging**:
   - `messages` table for group messages
   - `user_messages` table for direct messages between users

## Indexes

The database includes the following indexes to optimize query performance:

1. Primary key indexes on all tables
2. Foreign key indexes for all relationships
3. Unique indexes on:
   - `users.phone_number`
   - `users.email`
   - `admins.username`
   - `admins.email`
4. Additional indexes on:
   - `otps.phone_number` and `otps.expires_at`
   - `sessions.token` and `sessions.expires_at`
   - `messages.created_at`
   - `user_messages.created_at`
   - `sms_logs.phone_number` and `sms_logs.created_at`

## Data Integrity

The database schema enforces data integrity through:

1. **Primary Keys**: Every table has a UUID primary key (except `app_settings` which uses an integer)
2. **Foreign Keys**: All relationships are enforced with foreign key constraints
3. **Unique Constraints**: Applied to fields that must be unique (phone numbers, emails, usernames)
4. **Not Null Constraints**: Applied to required fields
5. **Default Values**: Sensible defaults for boolean flags, timestamps, and status fields

## Initialization

The database is initialized with:

1. Default app settings in the `app_settings` table
2. A default admin user in the `admins` table (credentials specified in environment variables)

## Maintenance

Regular database maintenance should include:

1. Cleaning up expired OTPs and sessions
2. Archiving old messages and logs
3. Backing up the database regularly
4. Monitoring database performance and optimizing queries as needed

## Security Considerations

1. Passwords are never stored in plain text (admin passwords are hashed)
2. Sensitive data access is restricted through application-level permissions
3. Database connections use SSL in production environments
4. Database credentials are stored in environment variables, not in code