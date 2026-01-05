# Firebase Service Account File Setup

## Where to Place the File

### Recommended Location
Place the Firebase service account JSON file in the **backend root directory**:

```
backend/
├── firebase-service-account.json  ← Place it here
├── cmd/
├── config/
├── .env
└── ...
```

### Alternative Locations
You can place it anywhere, but you'll need to use the correct path in your `.env` file.

## How to Get the File

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **better-uptime-auth**
3. Click the gear icon ⚙️ → **Project settings**
4. Go to **Service accounts** tab
5. Click **Generate new private key**
6. Save the downloaded JSON file

## Setting Up in .env

### Option 1: Relative Path (Recommended)
If the file is in the backend root directory:

```env
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
```

Or if it's in the same directory as your `.env`:

```env
FIREBASE_SERVICE_ACCOUNT=firebase-service-account.json
```

### Option 2: Absolute Path
If the file is elsewhere on your system:

```env
FIREBASE_SERVICE_ACCOUNT=/Users/nirmalmishra/Desktop/Projects/Better-uptime/backend/firebase-service-account.json
```

### Option 3: In a Config Directory
If you want to organize it better:

```env
FIREBASE_SERVICE_ACCOUNT=./config/firebase-service-account.json
```

## Security Note

⚠️ **IMPORTANT**: Add the file to `.gitignore` to prevent committing it to git!

Make sure your `.gitignore` includes:
```
firebase-service-account.json
*.json
# or specifically:
**/firebase-service-account.json
```

## Testing

After setting up, restart your backend server. You should see:

```
✅ Firebase Auth initialized successfully
```

If you see an error, check:
1. File path is correct
2. File exists at that location
3. File has proper JSON format
4. File has read permissions

## Example .env File

```env
PORT=8080
POSTGRES_CONNECTION=postgresql://user:password@localhost:5432/better_uptime
FIREBASE_SERVICE_ACCOUNT=./firebase-service-account.json
```
