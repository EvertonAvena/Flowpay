# ✅ Firebase Setup Checklist

Use this checklist to make sure everything is configured correctly!

---

## 📋 Pre-Setup
- [ ] I have a Google account (Gmail)
- [ ] I have the FlowPay project open in VS Code
- [ ] Firebase packages are installed (`@react-native-firebase/app`, `@react-native-firebase/auth`)

---

## 🔥 Firebase Console Setup

### Create Project:
- [ ] Went to https://console.firebase.google.com/
- [ ] Created new project named "FlowPay" (or similar)
- [ ] Project is ready (can see the dashboard)

### Register App:
- [ ] Clicked Android icon to add Android app
- [ ] Entered package name from `app.json` (e.g., `com.yourname.flowpay`)
- [ ] Downloaded `google-services.json`
- [ ] Moved `google-services.json` to `flowpay/android/app/` folder

### Enable Phone Auth:
- [ ] Went to **Authentication** in left sidebar
- [ ] Clicked **"Get started"**
- [ ] Went to **"Sign-in method"** tab
- [ ] Found **"Phone"** provider
- [ ] Clicked toggle to **Enable**
- [ ] Clicked **Save**

### Get Firebase Config:
- [ ] Went to **Project Settings** (⚙️ gear icon)
- [ ] Scrolled to **"Your apps"** → Android app
- [ ] Found **"Firebase SDK snippet"**
- [ ] Selected **"Config"** tab
- [ ] Copied all config values (apiKey, authDomain, projectId, etc.)

---

## 📝 Code Configuration

### Update firebaseConfig.js:
- [ ] Opened `flowpay/firebaseConfig.js`
- [ ] Replaced `"YOUR_API_KEY"` with real value from Firebase
- [ ] Replaced `"YOUR_PROJECT_ID"` with real value
- [ ] Replaced `"YOUR_MESSAGING_SENDER_ID"` with real value
- [ ] Replaced `"YOUR_APP_ID"` with real value
- [ ] Saved the file

### Configure Android:
- [ ] Opened `flowpay/android/build.gradle`
- [ ] Added Google Services classpath: `classpath 'com.google.gms:google-services:4.4.0'`
- [ ] Opened `flowpay/android/app/build.gradle`
- [ ] Added plugin at bottom: `apply plugin: 'com.google.gms.google-services'`
- [ ] Saved both files

---

## 🧪 Testing Setup (Optional but Recommended)

### Add Test Phone Number:
- [ ] In Firebase Console → **Authentication** → **Phone**
- [ ] Scrolled to **"Phone numbers for testing"**
- [ ] Clicked **"Add phone number"**
- [ ] Added my phone: `+639489381943` (or your number)
- [ ] Set test code: `123456` (any 6 digits)
- [ ] Clicked **"Add"**

**Why?** This lets you test WITHOUT sending real SMS (free & unlimited!)

---

## 🚀 Build & Test

### Rebuild App:
- [ ] Stopped any running Metro bundler
- [ ] Ran `npx expo prebuild --clean` to regenerate Android config
- [ ] Ran `npx expo run:android` to build with Firebase

### Test SMS Verification:
- [ ] App opened successfully
- [ ] Went to **Signup** screen
- [ ] Entered phone number (test number if configured)
- [ ] Clicked **"Send Code"**
- [ ] Received SMS (or used test code `123456`)
- [ ] Entered OTP code
- [ ] Phone verified successfully! ✅
- [ ] Completed profile (name, email, MPIN)
- [ ] User saved to Supabase database

---

## 🔍 Verification

### Check Firebase Console:
- [ ] Went to **Authentication** → **Users** tab
- [ ] Can see the verified phone number listed

### Check Supabase:
- [ ] Went to Supabase dashboard → **Table Editor** → **profile**
- [ ] Can see the new user with phone number, name, email, MPIN

---

## ❌ Troubleshooting

If something doesn't work, check these:

### SMS Not Sending:
- [ ] Phone auth is **enabled** in Firebase Console
- [ ] `google-services.json` is in `android/app/` folder
- [ ] App was **rebuilt** after adding Firebase: `npx expo run:android`
- [ ] Using **international format**: `+639489381943` (not `09489381943`)

### "Invalid Firebase Configuration":
- [ ] Checked `firebaseConfig.js` has real values (not placeholders)
- [ ] All fields filled: apiKey, authDomain, projectId, appId
- [ ] No extra quotes or typos in config

### "Too many requests":
- [ ] Used more than 10 SMS today (free limit)
- [ ] Solution: Add test phone number (unlimited free testing)

### App Crashes:
- [ ] Checked `android/build.gradle` has Google Services plugin
- [ ] Checked `android/app/build.gradle` has `apply plugin`
- [ ] Ran `npx expo prebuild --clean` to regenerate config
- [ ] Rebuilt the app completely

---

## 🎉 Success Criteria

You're done when:
- ✅ Firebase project created and configured
- ✅ Phone authentication enabled in Firebase Console
- ✅ `firebaseConfig.js` updated with real credentials
- ✅ `google-services.json` in correct folder
- ✅ Android build.gradle files updated
- ✅ App rebuilt successfully
- ✅ SMS verification works (real or test number)
- ✅ User data saves to Supabase after phone verification

---

## 📚 Resources

- **Full Setup Guide**: `FIREBASE_SETUP.md`
- **Integration Overview**: `FIREBASE_INTEGRATION.md`
- **Firebase Docs**: https://firebase.google.com/docs/auth/android/phone-auth
- **React Native Firebase**: https://rnfirebase.io/auth/phone-auth

---

**Happy coding! 🚀**

If you get stuck, check `FIREBASE_SETUP.md` for detailed explanations.
