# 🔥 Firebase SMS OTP Setup Guide (Expo Compatible)

This guide will help you set up **Firebase Phone Authentication** for **FREE SMS OTP** in your FlowPay app using **Expo**.

---

## 📋 What You Need

- A Google account (Gmail)
- Your FlowPay project (already installed Firebase packages ✅)
- 10 minutes of setup time
- **Works with Expo Go!** 🎉 (No need for development build)

---

## 🚀 Step-by-Step Setup

### 1️⃣ Create Firebase Project

1. Go to **Firebase Console**: https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **`FlowPay`** (or any name you like)
4. **Disable Google Analytics** (optional, you can skip it for now)
5. Click **"Create project"** and wait ~30 seconds
6. Click **"Continue"** when ready

---

### 2️⃣ Register Your App (Web Platform)

**Important:** We're using Firebase **Web SDK** (not native), so register as a **Web app**:

1. In Firebase Console, click the **</> (Web icon)**
2. Fill in these fields:
   - **App nickname**: `FlowPay` (or any name you like)
   - ❌ **Don't check** "Also set up Firebase Hosting"
3. Click **"Register app"**
4. You'll see Firebase configuration - **copy this for later**:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyBxxx...",
     authDomain: "flowpay-xxxxx.firebaseapp.com",
     projectId: "flowpay-xxxxx",
     storageBucket: "flowpay-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:xxxxx"
   };
   ```
5. Click **"Continue to console"**

**Note:** We're using the Web SDK because it works with Expo Go without requiring a development build!

---

### 3️⃣ Enable Phone Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Find **"Phone"** in the list
5. Click **"Phone"** → **"Enable"** toggle
6. Click **"Save"**

✅ **That's it!** Phone Auth is now enabled.

---

### 4️⃣ Get Your Firebase Config

You should have copied this in Step 2, but if not:

1. In Firebase Console, click the **⚙️ (gear icon)** → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. You'll see your Web app - click on it if needed
4. Find the **"Firebase SDK snippet"** section
5. Select **"Config"** (not CDN)
6. You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBxxx...",
  authDomain: "flowpay-xxxxx.firebaseapp.com",
  projectId: "flowpay-xxxxx",
  storageBucket: "flowpay-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxxxx"  // Note: web app ID
};
```

7. **Copy all these values** ✂️

---

### 5️⃣ Update firebaseConfig.js

1. Open `flowpay/firebaseConfig.js`
2. Replace the placeholder values with your **real Firebase config**:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",              // Paste from Firebase
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // Paste from Firebase
  projectId: "YOUR_PROJECT_ID",               // Paste from Firebase
  storageBucket: "YOUR_PROJECT_ID.appspot.com", // Paste from Firebase
  messagingSenderId: "YOUR_SENDER_ID",        // Paste from Firebase
  appId: "YOUR_APP_ID",                       // Paste from Firebase
};
```

3. **Save the file** 💾

**That's it!** No need to configure Android or iOS native files since we're using the Web SDK with Expo.

---

### 6️⃣ Test SMS Verification

#### For Testing (FREE - No Credit Card):

1. In Firebase Console → **Authentication** → **Phone**
2. Scroll to **"Phone numbers for testing"**
3. Click **"Add phone number"**
4. Add a test number (use your Philippine number):
   - **Phone number**: `+639489381943` (your number)
   - **Test code**: `123456` (any 6-digit code you choose)
5. Click **"Add"**

Now when you use this number in your app:
- ✅ No SMS will be sent (free!)
- ✅ The OTP will always be `123456` (or whatever you set)
- ✅ Perfect for testing without paying

#### For Production (Real SMS):

Firebase gives you **FREE SMS** for testing:
- ✅ **First 10 verifications per day = FREE**
- ✅ **No credit card required** for testing quota
- 💰 After 10/day, you need to upgrade (but free tier is enough for development)

---

### 7️⃣ Run Your App

1. **Start the app** (no rebuild needed!):
   ```bash
   npm start
   ```

2. **Open in Expo Go** on your phone

3. **Test the signup flow**:
   - Enter your phone number: `+639489381943`
   - Click "Send Code"
   - If using test number → enter `123456`
   - If using real number → check your SMS

---

## 🎯 Architecture Explained

Here's how Firebase + Supabase work together:

```
┌─────────────────┐
│  User enters    │
│  phone number   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Firebase sends │  ← FREE SMS (10/day for testing)
│  real SMS OTP   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User enters OTP │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Firebase verifies│  ← Fast, reliable verification
│    the OTP      │
└────────┬────────┘
         │
         ▼  Phone verified ✅
         │
         ▼
┌─────────────────┐
│ User completes  │
│ profile (name,  │
│ email, MPIN)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase saves │  ← All user data stored here
│  user profile   │     (PostgreSQL database)
└─────────────────┘
```

**Key Points:**
- 📱 Firebase = Phone verification ONLY (SMS OTP)
- 🗄️ Supabase = Database, user profiles, app data
- 🔐 Login = Phone + MPIN (no SMS needed after signup)
- 💰 Cost = FREE for testing (10 SMS/day)

---

## 🔧 Troubleshooting

### ❌ "Firebase: Error sending SMS"

**Solution:**
1. Check Firebase Console → Authentication → Phone is **enabled**
2. Make sure `firebaseConfig.js` has correct values
3. Check your internet connection
4. Try restarting Expo: `npm start --clear`

---

### ❌ "Invalid phone number format"

**Solution:**
- Phone must be in **international format**: `+639489381943`
- ✅ Correct: `+639489381943`
- ❌ Wrong: `09489381943`

The app automatically formats it, but make sure Firebase config is correct.

---

### ❌ "A system error has occurred"

**Solution:**
- Enable billing in Firebase (still free for <10 SMS/day)
- Or add your number as a **test phone number** (see step 7)

---

### ❌ "Too many requests"

**Solution:**
- Firebase limits: **10 SMS verifications per day** (free tier)
- Use **test phone numbers** for development
- For production, upgrade to Blaze plan (pay-as-you-go)

---

## 📊 Firebase Free Tier Limits

| Feature              | Free Tier Limit       |
| -------------------- | --------------------- |
| SMS verifications    | 10 per day            |
| Test phone numbers   | Unlimited (no SMS sent) |
| Phone Auth users     | Unlimited             |
| Database reads/writes| N/A (we use Supabase) |

For development, **10 SMS per day is plenty!** Use test numbers for unlimited testing.

---

## 🎉 You're Done!

Your app now has:
- ✅ **FREE SMS OTP** verification with Firebase
- ✅ **User data storage** in Supabase
- ✅ **Phone + MPIN login** (no SMS needed after signup)
- ✅ **Best of both worlds!**

---

## 📚 Next Steps

1. **Test signup** with a real phone number
2. **Add test numbers** for unlimited free testing
3. **Check Firebase Console** → Authentication → Users to see verified phones
4. **Deploy to production** when ready (upgrade to Blaze plan for unlimited SMS)

---

## 🆘 Need Help?

- Firebase Docs: https://firebase.google.com/docs/auth/android/phone-auth
- React Native Firebase: https://rnfirebase.io/auth/phone-auth
- Supabase Docs: https://supabase.com/docs

---

**Happy coding! 🚀**
