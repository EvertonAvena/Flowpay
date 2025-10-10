# ℹ️ Firebase reCAPTCHA Notice

## 📋 What You're Seeing

```
LOG  Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.
```

## ✅ This is NORMAL - Not an Error!

This message means:
- ✅ Firebase is working correctly
- ✅ It's using reCAPTCHA v2 (free version)
- ✅ SMS verification will work fine
- ℹ️ reCAPTCHA Enterprise is a paid feature (you don't need it)

**You can safely ignore this message!**

---

## 🚨 What You DO Need to Fix

Right now, your `firebaseConfig.js` has placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // ← These are placeholders
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ...
};
```

**You need to replace these with your REAL Firebase values!**

---

## 🎯 Quick Fix (5 Minutes)

### Step 1: Create Firebase Project

1. Go to: https://console.firebase.google.com/
2. Click **"Add project"**
3. Name: **"FlowPay"**
4. Click **"Create project"**

### Step 2: Register Web App

1. Click the **</> (web icon)**
2. App nickname: **"FlowPay"**
3. Click **"Register app"**
4. **COPY** the config that appears

### Step 3: Enable Phone Auth

1. Left sidebar: **Authentication** → **"Get started"**
2. Tab: **"Sign-in method"**
3. Find **"Phone"** → Enable it
4. Click **"Save"**

### Step 4: Update Your Code

1. Open `firebaseConfig.js`
2. Replace the placeholders with your REAL values from Step 2
3. Save the file

### Step 5: Test!

1. Restart Expo: Press `r` in terminal (or `npm start`)
2. Go to Signup
3. Enter your phone number
4. Click "Send Code"
5. Check your SMS! 📱

---

## 🎉 Once Configured

After you add your real Firebase config:
- ✅ SMS will be sent to your phone
- ✅ You'll get a real OTP code
- ✅ FREE (10 SMS per day)
- ✅ The reCAPTCHA message will still appear (it's normal!)

---

## 💡 Pro Tip: Unlimited Free Testing

Add a test phone number in Firebase Console:
1. **Authentication** → **Phone** → **"Phone numbers for testing"**
2. Add: `+639489381943` (your number)
3. Test code: `123456`
4. Now use `123456` every time - no real SMS sent!

---

## 📚 Need Help?

See **`QUICKSTART_FIREBASE.md`** for the complete 5-minute setup guide.

---

**TL;DR:** The reCAPTCHA message is normal. Just set up Firebase Console and you're good to go! 🚀
