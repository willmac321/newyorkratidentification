# Firebase Hosting with Custom Domain (Porkbun)

## Prerequisites

1. Firebase project created
2. Domain registered on Porkbun
3. Firebase CLI installed and logged in

## Step 1: Initial Firebase Setup (if not done)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase (if not already done):
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory: `dist`
   - Configure as single-page app: **Yes**
   - Set up automatic builds: **No**

4. Update `.firebaserc` with your actual Firebase project ID

## Step 2: Deploy to Firebase (First Time)

1. Build your application:
   ```bash
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```

3. Note the Firebase hosting URL (e.g., `your-project.web.app`)

## Step 3: Add Custom Domain in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Hosting** in the left sidebar
4. Click **Add custom domain**
5. Enter your domain (e.g., `nycratidentification.com` or `www.nycratidentification.com`)
6. Click **Continue**

## Step 4: Configure DNS in Porkbun

Firebase will provide you with DNS records. You'll need to add these in Porkbun:

### Option A: Using A Records (Recommended for root domain)

1. Log in to your Porkbun account
2. Go to **Domain Management** → Select your domain
3. Click on **DNS** tab
4. Add the following records:

   **For root domain (nycratidentification.com):**
   - Type: **A**
   - Name: **@** (or leave blank)
   - Value: Firebase will provide IP addresses (usually 2-4 IPs)
   - TTL: 3600 (or default)

   **For www subdomain (www.nycratidentification.com):**
   - Type: **CNAME**
   - Name: **www**
   - Value: Firebase will provide (e.g., `your-project.web.app`)
   - TTL: 3600 (or default)

### Option B: Using CNAME (For subdomain only)

If you only want to use a subdomain:
- Type: **CNAME**
- Name: **www** (or your desired subdomain)
- Value: Firebase provided hostname (e.g., `your-project.web.app`)

## Step 5: Verify Domain in Firebase

1. After adding DNS records in Porkbun, go back to Firebase Console
2. Click **Verify** next to your domain
3. Wait for DNS propagation (can take a few minutes to 48 hours, usually 15-30 minutes)
4. Firebase will verify ownership automatically

## Step 6: SSL Certificate Setup

1. Once verified, Firebase will automatically provision an SSL certificate
2. This usually takes a few minutes
3. You'll see a green checkmark when SSL is active

## Step 7: Final Deployment

1. Build your app:
   ```bash
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```

3. Your site will be live at your custom domain!

## Troubleshooting

### DNS Not Propagating
- Wait 15-30 minutes after adding DNS records
- Use DNS checker tools like `whatsmydns.net` to verify propagation
- Ensure TTL values are reasonable (3600 seconds is good)

### SSL Certificate Issues
- Wait up to 24 hours for SSL certificate provisioning
- Ensure DNS records are correctly configured
- Check Firebase Console for any error messages

### Domain Not Resolving
- Verify DNS records in Porkbun match Firebase requirements exactly
- Check for typos in domain name
- Ensure you're using the correct record type (A for root, CNAME for subdomain)

## Quick Reference Commands

```bash
# Build
npm run build

# Deploy
firebase deploy --only hosting

# View deployment history
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

## Notes

- Firebase Hosting provides free SSL certificates automatically
- You can add multiple domains to the same Firebase project
- Both `example.com` and `www.example.com` can be configured
- Firebase will handle redirects if configured

