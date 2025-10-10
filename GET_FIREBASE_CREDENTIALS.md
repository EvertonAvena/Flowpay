# 🔥 GET YOUR FIREBASE CREDENTIALS - DO THIS NOW!

## ⚠️ CURRENT STATUS

Your `firebaseConfig.js` has **DUMMY VALUES** that won't work for real SMS.

You need to replace them with **YOUR REAL** Firebase credentials.

---

## 🎯 STEP-BY-STEP GUIDE (5 Minutes)

### Step 1: Go to Firebase Console

Open this link: **https://console.firebase.google.com/**

---

### Step 2: Create New Project

1. Click the big **"Add project"** or **"Create a project"** button
2. **Project name:** Type `FlowPay` (or any name you like)
3. Click **"Continue"**
4. **Google Analytics:** Turn it OFF (we don't need it) or leave it on
5. Click **"Create project"**
6. Wait ~30 seconds for it to finish
7. Click **"Continue"** when ready

---

### Step 3: Add Web App

1. You'll see your project dashboard
2. Look for this icon: **</>** (web platform icon)
3. Click the **</>** icon
4. **App nickname:** Type `FlowPay`
5. **❌ DO NOT check** "Also set up Firebase Hosting"
6. Click **"Register app"**

---

### Step 4: COPY YOUR CONFIG

You'll see a code snippet that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",                    // ← Copy this
  authDomain: "flowpay-xxxxx.firebaseapp.com",  // ← Copy this
  projectId: "flowpay-xxxxx",              // ← Copy this
  storageBucket: "flowpay-xxxxx.appspot.com",   // ← Copy this
  messagingSenderId: "123456789",          // ← Copy this
  appId: "1:123456789:web:abc..."          // ← Copy this
};
```

**✂️ COPY ALL THESE VALUES!** You'll need them in the next step.

Click **"Continue to console"**

---

### Step 5: Enable Phone Authentication

1. In the left sidebar, click **"Authentication"** (or **"Build"** → **"Authentication"**)
2. Click the **"Get started"** button
3. Click the **"Sign-in method"** tab at the top
4. Scroll down and find **"Phone"** in the list
5. Click on **"Phone"**
6. Toggle the switch to **"Enable"**
7. Click **"Save"**

✅ Phone authentication is now enabled!

---

### Step 6: UPDATE YOUR CODE

1. Open `firebaseConfig.js` in your project
2. Find these lines:

```javascript
export const firebaseConfig = {
  apiKey: "AIzaSyDummy-Replace-With-Your-Real-API-Key-12345",
  authDomain: "flowpay-demo.firebaseapp.com",
  projectId: "flowpay-demo",
  storageBucket: "flowpay-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef",
};
```

3. **Replace them** with YOUR values from Step 4

**Example:**
```javascript
export const firebaseConfig = {
  apiKey: "AIzaSyC1a2b3c4d5e6f7g8h9i0j-RealKeyHere",  // ← YOUR real key
  authDomain: "flowpay-a1b2c.firebaseapp.com",       // ← YOUR domain
  projectId: "flowpay-a1b2c",                        // ← YOUR project ID
  storageBucket: "flowpay-a1b2c.appspot.com",        // ← YOUR storage
  messagingSenderId: "987654321098",                 // ← YOUR sender ID
  appId: "1:987654321098:web:xyz123abc456",          // ← YOUR app ID
};
```

4. **Save the file** (Ctrl + S)

---

### Step 7: Test It!

1. In your terminal (Expo), press **`r`** to reload the app
2. Open the app on your phone (Expo Go)
3. Go to **Signup** screen
4. Enter your phone number: `+639489381943` (your real number)
5. Click **"Send Code"**
6. **Check your SMS!** 📱

You should receive a real OTP code!

---

## 💡 BONUS: Unlimited Free Testing

Want to test without using your 10 free SMS per day?

1. In Firebase Console, go to **Authentication** → **Phone**
2. Scroll down to **"Phone numbers for testing"**
3. Click **"Add phone number"**
4. Phone: `+639489381943` (your number)
5. Test code: `123456` (or any 6 digits you choose)
6. Click **"Add"**

Now when you test:
- ✅ No real SMS will be sent
- ✅ Always use code `123456` (or whatever you set)
- ✅ Unlimited free testing!

---

## ❓ TROUBLESHOOTING

### "Firebase: Error (auth/invalid-api-key)"
→ You didn't update the config. Go back to Step 6.

### "Firebase: Error (auth/project-not-found)"
→ Wrong projectId. Make sure you copied it correctly.

### "Can't send SMS"
→ Phone auth not enabled. Go back to Step 5.

### "Too many requests"
→ You hit the 10 SMS/day limit. Add a test phone number (see Bonus section).

---

## 📊 WHAT YOU GET

✅ **FREE SMS** - 10 verifications per day  
✅ **Works globally** - Any country including Philippines  
✅ **Test numbers** - Unlimited free testing  
✅ **Production ready** - Scales to millions  
✅ **No credit card** needed for testing  

---

## ⏱️ TIME ESTIMATE

- Create project: 1 minute
- Add web app: 30 seconds
- Enable phone auth: 30 seconds
- Copy config: 30 seconds
- Update code: 1 minute
- Test: 1 minute

**Total: ~5 minutes** ⚡

---

## 🎉 DONE!

After following these steps:
- ✅ Firebase is configured
- ✅ SMS verification works
- ✅ You can test with real phone numbers
- ✅ FREE for testing and development!

---

**START HERE:** https://console.firebase.google.com/

Good luck! 🚀
