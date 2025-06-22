# Migration Guide: Firebase to Custom Backend

This guide provides detailed instructions for migrating the Super Chat application from Firebase to the custom backend. It includes specific file locations and code changes needed for both the Android app and the admin panel.

## Table of Contents

1. [Overview](#overview)
2. [Android App Migration](#android-app-migration)
3. [Admin Panel Migration](#admin-panel-migration)
4. [Testing the Migration](#testing-the-migration)
5. [Troubleshooting](#troubleshooting)

## Overview

The Super Chat application currently uses Firebase for:
- Authentication
- Realtime Database
- Cloud Functions
- Cloud Messaging (FCM)
- Storage

To migrate to the custom backend, we need to replace these Firebase services with API calls to our custom backend server.

## Android App Migration

### 1. Update Configuration Files

#### Create API Configuration Class

Create a new file `ApiConfig.java` in the package structure:

```java
package com.teamxdevelopers.SuperChat.api;

public class ApiConfig {
    // Base URL for the API
    public static final String BASE_URL = "http://your-server-ip:3000/api";
    
    // Authentication endpoints
    public static final String SEND_OTP = BASE_URL + "/auth/send-otp";
    public static final String VERIFY_OTP = BASE_URL + "/auth/verify-otp";
    public static final String LOGOUT = BASE_URL + "/auth/logout";
    
    // User endpoints
    public static final String GET_USER = BASE_URL + "/users";
    public static final String UPDATE_PROFILE = BASE_URL + "/users/profile";
    public static final String UPDATE_NOTIFICATION_TOKEN = BASE_URL + "/users/notification-token";
    public static final String BLOCK_USER = BASE_URL + "/users/block";
    public static final String UNBLOCK_USER = BASE_URL + "/users/unblock";
    public static final String REPORT_USER = BASE_URL + "/users/report";
    
    // Group endpoints
    public static final String CREATE_GROUP = BASE_URL + "/groups";
    public static final String GET_GROUPS = BASE_URL + "/groups/user";
    public static final String GET_GROUP = BASE_URL + "/groups";
    public static final String UPDATE_GROUP = BASE_URL + "/groups";
    public static final String ADD_MEMBER = BASE_URL + "/groups/members";
    public static final String REMOVE_MEMBER = BASE_URL + "/groups/members";
    public static final String UPDATE_ADMIN = BASE_URL + "/groups/admin";
    public static final String REPORT_GROUP = BASE_URL + "/groups/report";
    
    // Message endpoints
    public static final String SEND_MESSAGE = BASE_URL + "/messages";
    public static final String GET_MESSAGES = BASE_URL + "/messages";
    
    // Headers
    public static final String HEADER_AUTH = "Authorization";
    public static final String HEADER_BEARER = "Bearer ";
}
```

### 2. Create API Service Classes

Create the following service classes to handle API requests:

#### AuthService.java

```java
package com.teamxdevelopers.SuperChat.api.services;

import android.content.Context;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.teamxdevelopers.SuperChat.api.ApiConfig;
import com.teamxdevelopers.SuperChat.utils.PreferenceManager;

import org.json.JSONException;
import org.json.JSONObject;

public class AuthService {
    private RequestQueue requestQueue;
    private PreferenceManager preferenceManager;
    
    public AuthService(Context context) {
        requestQueue = Volley.newRequestQueue(context);
        preferenceManager = new PreferenceManager(context);
    }
    
    public interface AuthCallback {
        void onSuccess(JSONObject response);
        void onError(String error);
    }
    
    public void sendOtp(String phoneNumber, final AuthCallback callback) {
        JSONObject params = new JSONObject();
        try {
            params.put("phone_number", phoneNumber);
        } catch (JSONException e) {
            callback.onError("Error creating request: " + e.getMessage());
            return;
        }
        
        JsonObjectRequest request = new JsonObjectRequest(
            Request.Method.POST,
            ApiConfig.SEND_OTP,
            params,
            new Response.Listener<JSONObject>() {
                @Override
                public void onResponse(JSONObject response) {
                    callback.onSuccess(response);
                }
            },
            new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    callback.onError("Network error: " + error.getMessage());
                }
            }
        );
        
        requestQueue.add(request);
    }
    
    public void verifyOtp(String phoneNumber, String otpCode, final AuthCallback callback) {
        JSONObject params = new JSONObject();
        try {
            params.put("phone_number", phoneNumber);
            params.put("otp_code", otpCode);
        } catch (JSONException e) {
            callback.onError("Error creating request: " + e.getMessage());
            return;
        }
        
        JsonObjectRequest request = new JsonObjectRequest(
            Request.Method.POST,
            ApiConfig.VERIFY_OTP,
            params,
            new Response.Listener<JSONObject>() {
                @Override
                public void onResponse(JSONObject response) {
                    try {
                        // Save the JWT token
                        String token = response.getString("token");
                        preferenceManager.setString("jwt_token", token);
                        
                        // Save user ID
                        JSONObject user = response.getJSONObject("user");
                        String userId = user.getString("id");
                        preferenceManager.setString("user_id", userId);
                        
                        callback.onSuccess(response);
                    } catch (JSONException e) {
                        callback.onError("Error parsing response: " + e.getMessage());
                    }
                }
            },
            new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    callback.onError("Network error: " + error.getMessage());
                }
            }
        );
        
        requestQueue.add(request);
    }
    
    public void logout(final AuthCallback callback) {
        String token = preferenceManager.getString("jwt_token", "");
        if (token.isEmpty()) {
            callback.onError("Not logged in");
            return;
        }
        
        JsonObjectRequest request = new JsonObjectRequest(
            Request.Method.POST,
            ApiConfig.LOGOUT,
            null,
            new Response.Listener<JSONObject>() {
                @Override
                public void onResponse(JSONObject response) {
                    // Clear saved preferences
                    preferenceManager.clear();
                    callback.onSuccess(response);
                }
            },
            new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    callback.onError("Network error: " + error.getMessage());
                }
            }
        ) {
            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> headers = new HashMap<>();
                headers.put(ApiConfig.HEADER_AUTH, ApiConfig.HEADER_BEARER + token);
                return headers;
            }
        };
        
        requestQueue.add(request);
    }
}
```

#### Create similar service classes for:
- UserService.java
- GroupService.java
- MessageService.java

### 3. Update Authentication Flow

Replace Firebase Authentication with custom backend authentication in the following files:

#### LoginActivity.java / PhoneAuthActivity.java

Replace Firebase phone authentication with custom OTP verification:

```java
// Replace Firebase authentication code with:
AuthService authService = new AuthService(this);

// When sending OTP
authService.sendOtp(phoneNumber, new AuthService.AuthCallback() {
    @Override
    public void onSuccess(JSONObject response) {
        // Navigate to OTP verification screen
    }
    
    @Override
    public void onError(String error) {
        // Show error message
    }
});

// When verifying OTP
authService.verifyOtp(phoneNumber, otpCode, new AuthService.AuthCallback() {
    @Override
    public void onSuccess(JSONObject response) {
        // Navigate to main activity
    }
    
    @Override
    public void onError(String error) {
        // Show error message
    }
});
```

### 4. Update User Profile Management

Replace Firebase Realtime Database operations with API calls in profile-related activities:

#### ProfileActivity.java / EditProfileActivity.java

```java
// Replace Firebase database operations with:
UserService userService = new UserService(this);

// When fetching user profile
userService.getUserProfile(new UserService.UserCallback() {
    @Override
    public void onSuccess(JSONObject response) {
        // Update UI with user data
    }
    
    @Override
    public void onError(String error) {
        // Show error message
    }
});

// When updating user profile
userService.updateProfile(name, status, photoUrl, new UserService.UserCallback() {
    @Override
    public void onSuccess(JSONObject response) {
        // Show success message
    }
    
    @Override
    public void onError(String error) {
        // Show error message
    }
});
```

### 5. Update Group Management

Replace Firebase Realtime Database operations with API calls in group-related activities:

#### CreateGroupActivity.java / GroupDetailsActivity.java

```java
// Replace Firebase database operations with:
GroupService groupService = new GroupService(this);

// When creating a group
groupService.createGroup(groupName, groupPhoto, members, new GroupService.GroupCallback() {
    @Override
    public void onSuccess(JSONObject response) {
        // Navigate back to groups list
    }
    
    @Override
    public void onError(String error) {
        // Show error message
    }
});

// When fetching group details
groupService.getGroupDetails(groupId, new GroupService.GroupCallback() {
    @Override
    public void onSuccess(JSONObject response) {
        // Update UI with group data
    }
    
    @Override
    public void onError(String error) {
        // Show error message
    }
});
```

### 6. Update Messaging

Replace Firebase Realtime Database operations with API calls in messaging-related activities:

#### ChatActivity.java / GroupChatActivity.java

```java
// Replace Firebase database operations with:
MessageService messageService = new MessageService(this);

// When sending a message
messageService.sendMessage(receiverId, content, type, new MessageService.MessageCallback() {
    @Override
    public void onSuccess(JSONObject response) {
        // Update UI with sent message
    }
    
    @Override
    public void onError(String error) {
        // Show error message
    }
});

// When fetching messages
messageService.getMessages(chatId, isGroup, lastMessageId, new MessageService.MessagesCallback() {
    @Override
    public void onSuccess(JSONArray messages) {
        // Update UI with messages
    }
    
    @Override
    public void onError(String error) {
        // Show error message
    }
});
```

### 7. Update FCM Integration

Update the FCM token registration to use the custom backend:

#### MyFirebaseMessagingService.java

```java
@Override
public void onNewToken(String token) {
    super.onNewToken(token);
    
    // Send the token to your server
    UserService userService = new UserService(this);
    userService.updateNotificationToken(token, new UserService.UserCallback() {
        @Override
        public void onSuccess(JSONObject response) {
            Log.d(TAG, "FCM token updated successfully");
        }
        
        @Override
        public void onError(String error) {
            Log.e(TAG, "Failed to update FCM token: " + error);
        }
    });
}
```

### 8. Update File Upload

Replace Firebase Storage with custom backend file upload:

#### Create a FileService.java class

```java
package com.teamxdevelopers.SuperChat.api.services;

import android.content.Context;
import android.net.Uri;

import com.android.volley.NetworkResponse;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.teamxdevelopers.SuperChat.api.ApiConfig;
import com.teamxdevelopers.SuperChat.utils.PreferenceManager;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

public class FileService {
    private RequestQueue requestQueue;
    private PreferenceManager preferenceManager;
    
    public FileService(Context context) {
        requestQueue = Volley.newRequestQueue(context);
        preferenceManager = new PreferenceManager(context);
    }
    
    public interface FileCallback {
        void onSuccess(JSONObject response);
        void onError(String error);
    }
    
    public void uploadFile(Uri fileUri, String fileType, final FileCallback callback) {
        String token = preferenceManager.getString("jwt_token", "");
        if (token.isEmpty()) {
            callback.onError("Not logged in");
            return;
        }
        
        try {
            // Read file into byte array
            File file = new File(fileUri.getPath());
            byte[] fileData = readFileToBytes(file);
            
            // Create multipart request
            MultipartRequest request = new MultipartRequest(
                ApiConfig.UPLOAD_FILE,
                null,
                new Response.Listener<NetworkResponse>() {
                    @Override
                    public void onResponse(NetworkResponse response) {
                        try {
                            String jsonString = new String(response.data);
                            JSONObject jsonResponse = new JSONObject(jsonString);
                            callback.onSuccess(jsonResponse);
                        } catch (Exception e) {
                            callback.onError("Error parsing response: " + e.getMessage());
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        callback.onError("Network error: " + error.getMessage());
                    }
                }
            ) {
                @Override
                public Map<String, String> getHeaders() {
                    Map<String, String> headers = new HashMap<>();
                    headers.put(ApiConfig.HEADER_AUTH, ApiConfig.HEADER_BEARER + token);
                    return headers;
                }
            };
            
            request.addPart(new MultipartRequest.FilePart("file", fileData, file.getName(), fileType));
            requestQueue.add(request);
            
        } catch (IOException e) {
            callback.onError("Error reading file: " + e.getMessage());
        }
    }
    
    private byte[] readFileToBytes(File file) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        FileInputStream fileInputStream = new FileInputStream(file);
        byte[] buffer = new byte[1024];
        int length;
        while ((length = fileInputStream.read(buffer)) != -1) {
            outputStream.write(buffer, 0, length);
        }
        fileInputStream.close();
        return outputStream.toByteArray();
    }
}
```

## Admin Panel Migration

### 1. Update Firebase Configuration

Replace the Firebase configuration in the admin panel with custom backend API calls.

#### Create API Service

Create a new file `api_service.dart` in the `lib` directory:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://your-server-ip:3000/api';
  
  // Authentication
  static Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/admin/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'password': password,
      }),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Save token
      final prefs = await SharedPreferences.getInstance();
      prefs.setString('admin_token', data['token']);
      return data;
    } else {
      throw Exception('Failed to login: ${response.body}');
    }
  }
  
  // Get dashboard stats
  static Future<List<int>> getDashboardStats() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('admin_token');
    
    final response = await http.get(
      Uri.parse('$baseUrl/admin/stats'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return List<int>.from(data['data']);
    } else {
      throw Exception('Failed to get stats: ${response.body}');
    }
  }
  
  // Get users
  static Future<List<dynamic>> getUsers() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('admin_token');
    
    final response = await http.get(
      Uri.parse('$baseUrl/admin/users'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'];
    } else {
      throw Exception('Failed to get users: ${response.body}');
    }
  }
  
  // Get groups
  static Future<List<dynamic>> getGroups() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('admin_token');
    
    final response = await http.get(
      Uri.parse('$baseUrl/admin/groups'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'];
    } else {
      throw Exception('Failed to get groups: ${response.body}');
    }
  }
  
  // Get reported users
  static Future<List<dynamic>> getReportedUsers() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('admin_token');
    
    final response = await http.get(
      Uri.parse('$baseUrl/admin/reported-users'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'];
    } else {
      throw Exception('Failed to get reported users: ${response.body}');
    }
  }
  
  // Get reported groups
  static Future<List<dynamic>> getReportedGroups() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('admin_token');
    
    final response = await http.get(
      Uri.parse('$baseUrl/admin/reported-groups'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'];
    } else {
      throw Exception('Failed to get reported groups: ${response.body}');
    }
  }
  
  // Get app settings
  static Future<Map<String, dynamic>> getSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('admin_token');
    
    final response = await http.get(
      Uri.parse('$baseUrl/admin/settings'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data'];
    } else {
      throw Exception('Failed to get settings: ${response.body}');
    }
  }
  
  // Update app settings
  static Future<Map<String, dynamic>> updateSettings(Map<String, dynamic> settings) async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('admin_token');
    
    final response = await http.put(
      Uri.parse('$baseUrl/admin/settings'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(settings),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data;
    } else {
      throw Exception('Failed to update settings: ${response.body}');
    }
  }
}
```

### 2. Update Login Screen

Modify the login screen to use the custom backend API:

#### login_screen.dart

```dart
// Replace Firebase authentication with:
void validateText() {
  if (_usernameController.text.isEmpty) {
    setState(() {
      errorText = "Enter Username";
      isError = true;
    });
  } else if (_passwordController.text.isEmpty) {
    setState(() {
      errorText = "Enter Password";
      isError = true;
    });
  } else {
    setState(() {
      isError = false;
    });
    startSignIn();
  }
}

void startSignIn() async {
  EasyLoading.show(status: 'Loading...');
  
  try {
    await ApiService.login(
      _usernameController.text.trim(),
      _passwordController.text,
    );
    EasyLoading.showSuccess("Success");
    // Navigate to dashboard
  } catch (e) {
    EasyLoading.showError("Failed");
    setState(() {
      isError = true;
      errorText = e.toString();
    });
  }
}
```

### 3. Update Dashboard Controller

Modify the dashboard controller to use the custom backend API:

#### dashboard_controller.dart

```dart
import 'package:flutter/foundation.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import '../api_service.dart';

class DashboardController extends ChangeNotifier {
  List<int> _counts = [0, 0, 0, 0, 0, 0, 0, 0];

  List<int> get counts => _counts;

  Future<void> fetchData() async {
    EasyLoading.show();
    try {
      _counts = await ApiService.getDashboardStats();
      notifyListeners();
      EasyLoading.dismiss();
    } catch (e) {
      if (kDebugMode) {
        print(e.toString());
      }
      EasyLoading.dismiss();
    }
  }
}
```

### 4. Update User Table Controller

Modify the user table controller to use the custom backend API:

#### user_table_controller.dart

```dart
import 'package:flutter/foundation.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import '../api_service.dart';
import '../model/user_model.dart';

class UserTableController extends ChangeNotifier {
  List<UserModel> _users = [];

  List<UserModel> get users => _users;

  Future<void> fetchUsers() async {
    EasyLoading.show();
    try {
      final usersData = await ApiService.getUsers();
      _users = usersData.map((user) => UserModel.fromJson(user)).toList();
      notifyListeners();
      EasyLoading.dismiss();
    } catch (e) {
      if (kDebugMode) {
        print(e.toString());
      }
      EasyLoading.dismiss();
    }
  }
  
  Future<void> disableUser(String userId, bool disabled) async {
    EasyLoading.show();
    try {
      await ApiService.updateUserStatus(userId, disabled);
      // Update local user list
      final index = _users.indexWhere((user) => user.id == userId);
      if (index != -1) {
        _users[index].disabled = disabled;
        notifyListeners();
      }
      EasyLoading.dismiss();
    } catch (e) {
      if (kDebugMode) {
        print(e.toString());
      }
      EasyLoading.dismiss();
    }
  }
}
```

### 5. Update Group Table Controller

Modify the group table controller to use the custom backend API:

#### group_table_controller.dart

```dart
import 'package:flutter/foundation.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import '../api_service.dart';
import '../model/group_model.dart';

class GroupTableController extends ChangeNotifier {
  List<GroupModel> _groups = [];

  List<GroupModel> get groups => _groups;

  Future<void> fetchGroups() async {
    EasyLoading.show();
    try {
      final groupsData = await ApiService.getGroups();
      _groups = groupsData.map((group) => GroupModel.fromJson(group)).toList();
      notifyListeners();
      EasyLoading.dismiss();
    } catch (e) {
      if (kDebugMode) {
        print(e.toString());
      }
      EasyLoading.dismiss();
    }
  }
  
  Future<void> disableGroup(String groupId, bool disabled) async {
    EasyLoading.show();
    try {
      await ApiService.updateGroupStatus(groupId, disabled);
      // Update local group list
      final index = _groups.indexWhere((group) => group.id == groupId);
      if (index != -1) {
        _groups[index].disabled = disabled;
        notifyListeners();
      }
      EasyLoading.dismiss();
    } catch (e) {
      if (kDebugMode) {
        print(e.toString());
      }
      EasyLoading.dismiss();
    }
  }
}
```

### 6. Update Settings Controller

Modify the settings controller to use the custom backend API:

#### settings_controller.dart

```dart
import 'package:flutter/foundation.dart';
import 'package:flutter_easyloading/flutter_easyloading.dart';
import '../api_service.dart';
import '../model/settings_model.dart';

class SettingsController extends ChangeNotifier {
  SettingsModel? _settings;

  SettingsModel? get settings => _settings;

  Future<void> fetchSettings() async {
    EasyLoading.show();
    try {
      final settingsData = await ApiService.getSettings();
      _settings = SettingsModel.fromJson(settingsData);
      notifyListeners();
      EasyLoading.dismiss();
    } catch (e) {
      if (kDebugMode) {
        print(e.toString());
      }
      EasyLoading.dismiss();
    }
  }
  
  Future<void> updateSettings(SettingsModel updatedSettings) async {
    EasyLoading.show();
    try {
      await ApiService.updateSettings(updatedSettings.toJson());
      _settings = updatedSettings;
      notifyListeners();
      EasyLoading.dismiss();
      EasyLoading.showSuccess("Settings updated successfully");
    } catch (e) {
      if (kDebugMode) {
        print(e.toString());
      }
      EasyLoading.dismiss();
      EasyLoading.showError("Failed to update settings");
    }
  }
}
```

## Testing the Migration

After making the above changes, follow these steps to test the migration:

1. Start the custom backend server:
   ```
   cd custom-backend
   npm run dev
   ```

2. Update the `BASE_URL` in the Android app's `ApiConfig.java` and the admin panel's `api_service.dart` to point to your server.

3. Build and run the Android app:
   ```
   cd SuperChat_Code-new
   ./gradlew assembleDebug
   ```

4. Build and run the admin panel:
   ```
   cd supperchat_admin_panel
   flutter run -d chrome
   ```

5. Test the following functionality:
   - User registration and login
   - Profile updates
   - Creating and managing groups
   - Sending and receiving messages
   - Admin panel login
   - Admin panel dashboard statistics
   - User and group management in the admin panel
   - Settings management in the admin panel

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Check that the JWT token is being properly stored and included in API requests
   - Verify that the token has not expired
   - Ensure the server's JWT secret matches the one in the .env file

2. **Network Errors**
   - Verify that the server is running and accessible
   - Check that the BASE_URL is correct in both apps
   - Ensure the device has internet connectivity
   - Check for any firewall or network restrictions

3. **Data Not Loading**
   - Check the API response format matches what the app expects
   - Verify that the user has the correct permissions
   - Check for any errors in the server logs

4. **Push Notifications Not Working**
   - Ensure the FCM server key is correctly set in the backend
   - Verify that the device token is being properly registered
   - Check that the notification payload format is correct

### Debugging Tips

1. Enable verbose logging in the Android app:
   ```java
   // Add this to your API service classes
   private static final boolean DEBUG = true;
   
   private void log(String message) {
       if (DEBUG) {
           Log.d("API_DEBUG", message);
       }
   }
   ```

2. Enable verbose logging in the admin panel:
   ```dart
   // Add this to your API service class
   static void _logRequest(String method, String url, dynamic body) {
     if (kDebugMode) {
       print('$method $url');
       if (body != null) {
         print('Body: $body');
       }
     }
   }
   ```

3. Check the server logs for any errors:
   ```
   cd custom-backend
   npm run dev
   ```

4. Use tools like Postman to test the API endpoints directly.

5. Implement a network interceptor to log all API requests and responses:
   ```java
   // For Android
   public class LoggingInterceptor implements Interceptor {
       @Override
       public Response intercept(Chain chain) throws IOException {
           Request request = chain.request();
           
           long t1 = System.nanoTime();
           Log.d("API_DEBUG", String.format("Sending request %s on %s%n%s",
                   request.url(), chain.connection(), request.headers()));
           
           Response response = chain.proceed(request);
           
           long t2 = System.nanoTime();
           Log.d("API_DEBUG", String.format("Received response for %s in %.1fms%n%s",
                   response.request().url(), (t2 - t1) / 1e6d, response.headers()));
           
           return response;
       }
   }
   ```

   ```dart
   // For Flutter
   class LoggingInterceptor extends InterceptorsWrapper {
     @override
     Future onRequest(RequestOptions options) async {
       if (kDebugMode) {
         print('REQUEST[${options.method}] => PATH: ${options.path}');
       }
       return super.onRequest(options);
     }
     
     @override
     Future onResponse(Response response) async {
       if (kDebugMode) {
         print('RESPONSE[${response.statusCode}] => PATH: ${response.request.path}');
       }
       return super.onResponse(response);
     }
     
     @override
     Future onError(DioError err) async {
       if (kDebugMode) {
         print('ERROR[${err.response?.statusCode}] => PATH: ${err.request.path}');
       }
       return super.onError(err);
     }
   }
   ```