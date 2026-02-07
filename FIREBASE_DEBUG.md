# Firebase Login Debugging Guide

## Common Issues and Solutions

### 1. Check Browser Console
Open DevTools (F12) → Console tab and look for errors when trying to login.

### 2. Check Firebase Console Settings
- Go to https://console.firebase.google.com
- Select your project: `better-uptime-auth`
- Go to Authentication → Sign-in method
- Ensure **Email/Password** is enabled
- Ensure **Google** is enabled (if using Google sign-in)

### 3. Check Authorized Domains
- Firebase Console → Authentication → Settings → Authorized domains
- Make sure your domain is listed (localhost should be there by default)

### 4. Check Backend Status
- Is your backend running on `http://localhost:8080`?
- Check backend logs for Firebase errors

### 5. Common Error Codes

#### `auth/operation-not-allowed`
- **Solution**: Enable Email/Password in Firebase Console → Authentication → Sign-in method

#### `auth/invalid-api-key`
- **Solution**: Check your Firebase config in `frontend/lib/firebase.ts`

#### `auth/network-request-failed`
- **Solution**: Check internet connection, firewall, or CORS settings

#### `firebase auth client not initialized` (Backend)
- **Solution**: Backend Firebase not initialized. You need to:
  1. Add Firebase initialization back to `backend/cmd/api/main.go`
  2. Set `FIREBASE_SERVICE_ACCOUNT` in backend `.env`
  3. Or use the bypass token `"frontend"` for testing

#### `Cannot connect to server`
- **Solution**: Backend is not running or wrong API URL

## Testing Steps

1. **Test Firebase Auth Directly**:
   ```javascript
   // In browser console on login page
   import { auth } from '@/lib/firebase';
   console.log('Auth initialized:', auth !== null);
   ```

2. **Test Backend Connection**:
   ```bash
   curl http://localhost:8080/v1/auth/login \
     -H "Authorization: Bearer frontend" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

3. **Check Network Tab**:
   - Open DevTools → Network tab
   - Try to login
   - Check the `/auth/login` request
   - Look at request/response headers and body

## Quick Fixes

### If using bypass token for testing:
Change in `frontend/lib/api.ts`:
```typescript
Authorization: `Bearer frontend`
```

### If backend Firebase not initialized:
The backend will accept `"frontend"` as a bypass token and use a test user.
