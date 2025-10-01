# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the DivyaYatri application.

## Prerequisites

1. A Google Account
2. Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" at the top
3. Click "New Project"
4. Enter project name: "DivyaYatri" (or your preferred name)
5. Click "Create"

## Step 2: Enable Google+ API

1. In your Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and then click "Enable"
4. Also enable "Google Identity" if prompted

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: External (for testing) or Internal (if you have a Google Workspace)
   - App name: DivyaYatri
   - User support email: Your email
   - Developer contact information: Your email
   - Add scopes: email, profile, openid
   - Add test users if using External type
4. For OAuth client ID:
   - Application type: Web application
   - Name: DivyaYatri Web Client
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production domain when ready
   - Authorized redirect URIs:
     - `http://localhost:5173` (for development)
     - Your production domain when ready

## Step 4: Get Your Credentials

1. After creating, you'll see your Client ID and Client Secret
2. Copy the Client ID - it should look like: `123456789-abcdefgh.apps.googleusercontent.com`
3. Copy the Client Secret - it should be a long string

## Step 5: Configure Environment Variables

### Client (.env file in client folder)
```bash
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
```

### Server (.env file in server folder)
```bash
GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
```

## Step 6: Test the Integration

1. Start your development servers
2. Navigate to the login or register page
3. Click "Continue with Google"
4. You should see the Google OAuth popup
5. Sign in with your Google account
6. You should be redirected back to your app and be logged in

## Troubleshooting

### Common Issues:

1. **"Invalid client" error**: Check that your Client ID is correctly set in both client and server .env files
2. **Redirect URI mismatch**: Ensure your development URL (http://localhost:5173) is added to authorized origins in Google Cloud Console
3. **Scope errors**: Make sure you have added email and profile scopes in the OAuth consent screen

### Security Notes:

- Never commit your actual .env files to version control
- Keep your Client Secret secure and never expose it in client-side code
- For production, use HTTPS and update your authorized origins accordingly
- Consider using environment-specific projects for development vs production

## Production Deployment

When deploying to production:

1. Update authorized origins to your production domain
2. Update environment variables with production values
3. Consider setting up domain verification in Google Cloud Console
4. Review and publish your OAuth consent screen if using External user type