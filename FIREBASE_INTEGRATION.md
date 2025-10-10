# 🔥 Firebase + Supabase Integration - Quick Reference

## 📱 How It Works

### **Signup Flow** (Firebase SMS + Supabase Storage)

```javascript
// 1. User enters phone number
const phoneNumber = "+639489381943";

// 2. Firebase sends SMS OTP (FREE!)
const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
// → Real SMS sent to user's phone

// 3. User enters OTP code
const otp = "123456";

// 4. Firebase verifies OTP
const userCredential = await confirmation.confirm(otp);
// → Phone verified! ✅

// 5. User completes profile (name, email, MPIN)
const profileData = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  mpin: "123456",
  phone: "+639489381943"
};

// 6. Save to Supabase database
await supabase
  .from('profile')
  .insert({
    fullname: `${firstName} ${lastName}`,
    username: username,
    email: email,
    phone: formattedPhone,
    address: address,
    birthdate: birthdate,
    mpin: mpin
  });
// → User data stored in Supabase ✅
```

---

### **Login Flow** (Phone + MPIN)

```javascript
// 1. User enters phone number
const phoneNumber = "+639489381943";

// 2. User enters MPIN
const mpin = "123456";

// 3. Look up user in Supabase
const { data: profile } = await supabase
  .from('profile')
  .select('*')
  .eq('phone', phoneNumber)
  .single();

// 4. Verify MPIN
if (profile.mpin === mpin) {
  // ✅ Login successful!
  // No SMS needed - phone already verified during signup
}
```

**Note:** No Firebase needed for login! Phone was already verified during signup. We just check MPIN against Supabase.

---

## 🏗️ File Structure

```
flowpay/
├── firebaseConfig.js          ← Firebase setup (NEW!)
├── supabase.js                ← Supabase setup (existing)
├── FIREBASE_SETUP.md          ← Setup guide (NEW!)
├── screens/
│   ├── SignupScreen.js        ← Uses Firebase SMS (UPDATED!)
│   └── LoginScreen.js         ← Uses Supabase MPIN (unchanged)
└── android/
    └── app/
        └── google-services.json  ← Download from Firebase Console
```

---

## 🔑 Key Differences

| Feature             | Firebase                  | Supabase               |
| ------------------- | ------------------------- | ---------------------- |
| **Phone Verification** | ✅ Yes (SMS OTP)       | ❌ No (removed)        |
| **User Database**   | ❌ No (we don't use it)   | ✅ Yes (PostgreSQL)    |
| **User Profiles**   | ❌ No                     | ✅ Yes                 |
| **Login**           | ❌ No (only for signup)   | ✅ Yes (phone + MPIN)  |
| **Cost (testing)**  | 🆓 FREE (10 SMS/day)      | 🆓 FREE               |

---

## 📋 What Changed

### ✅ Added Files:
1. `firebaseConfig.js` - Firebase initialization
2. `FIREBASE_SETUP.md` - Complete setup guide

### ✅ Modified Files:
1. `SignupScreen.js`:
   - Changed `sendOTP()` to use Firebase instead of Supabase
   - Changed `verifyOTP()` to use Firebase
   - Added `confirmation` state for Firebase verification object
   - User data still saves to Supabase after phone verification

2. `LoginScreen.js`:
   - Added comment about Firebase (no code changes needed)
   - Still uses phone + MPIN for login (no SMS)

### ✅ Installed Packages:
- `@react-native-firebase/app` - Firebase core
- `@react-native-firebase/auth` - Firebase authentication (phone)

---

## 🎯 User Experience

### **Before (Supabase SMS):**
- ❌ Required Twilio setup
- ❌ Not working with Philippine numbers
- ❌ Complex configuration

### **After (Firebase SMS):**
- ✅ FREE SMS (10/day for testing)
- ✅ Works with any country
- ✅ No credit card needed
- ✅ Easy setup (just follow FIREBASE_SETUP.md)
- ✅ User data still in Supabase (PostgreSQL)

---

## 🚀 Next Steps

1. **Follow FIREBASE_SETUP.md** to configure Firebase Console
2. **Update firebaseConfig.js** with your Firebase credentials
3. **Add google-services.json** to android/app/
4. **Rebuild the app**: `npx expo run:android`
5. **Test signup** with your phone number

---

## 💡 Pro Tips

### For Development:
- Add your phone as a **test number** in Firebase Console
- Use test code `123456` - no SMS sent, unlimited tests!

### For Production:
- Firebase free tier: **10 SMS verifications per day**
- Need more? Upgrade to Blaze plan (pay per SMS, very cheap)
- Average cost: **$0.01 - $0.05 per SMS** depending on country

---

## 📞 Support

- **Firebase Phone Auth Docs**: https://firebase.google.com/docs/auth/android/phone-auth
- **React Native Firebase**: https://rnfirebase.io/
- **Supabase Docs**: https://supabase.com/docs

---

**Your app now has FREE SMS verification! 🎉**
