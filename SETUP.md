# 🚀 Quick Setup Guide for PDF Quiz Generator with Firebase Auth

## Step-by-Step Setup Instructions

### 1. Install Dependencies

Run one of these commands in your terminal:

```powershell
# Using Bun (faster)
bun install

# OR using npm
npm install

# OR using yarn
yarn install
```

**If you get permission errors:**
- Run your terminal as Administrator
- Or try: `npm install --legacy-peer-deps`

---

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or use an existing project
3. Enter a project name (e.g., "pdf-quiz-generator")
4. Click Continue and finish setup

---

### 3. Enable Google Sign-In

1. In Firebase Console, click on **Authentication** in the left sidebar
2. Click **Get Started** (if first time)
3. Click on **Sign-in method** tab
4. Find **Google** in the providers list
5. Click on it and toggle **Enable**
6. Enter a support email (your email)
7. Click **Save**

---

### 4. Add Web App to Firebase

1. In Firebase Console, click the **gear icon** ⚙️ > **Project settings**
2. Scroll down to "Your apps" section
3. Click the **Web** icon `</>`
4. Enter an app nickname (e.g., "PDF Quiz Web App")
5. **Don't check** "Firebase Hosting" for now
6. Click **Register app**
7. **Copy** the firebaseConfig object that appears

---

### 5. Set Up Environment Variables

1. In your project folder, copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Open `.env` file in your editor

3. Add your **Groq API Key**:
   - Get it from [console.groq.com](https://console.groq.com)
   - Paste it in: `GROQ_API_KEY=your_key_here`

4. Add your **Firebase Config** (from step 4):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
   ```

---

### 6. Configure Authorized Domains (Important!)

1. In Firebase Console, go to **Authentication** > **Settings** tab
2. Scroll to **Authorized domains**
3. Make sure `localhost` is in the list (it should be by default)
4. When you deploy, add your production domain here too

---

### 7. Run the Development Server

```powershell
bun dev
# OR
npm run dev
```

---

### 8. Test the Application

1. Open [http://localhost:3000](http://localhost:3000)
2. You should be redirected to `/login`
3. Click "Continue with Google"
4. Sign in with your Google account
5. You'll be redirected to `/dashboard`
6. Upload a PDF and generate a quiz!

---

## 🎉 You're All Set!

Your PDF Quiz Generator with Firebase Authentication is now running!

## 📝 Common Issues

**Issue: "Firebase not initialized"**
- Solution: Check all environment variables are set correctly in `.env`
- Restart the dev server after changing `.env`

**Issue: "Unauthorized domain"**
- Solution: Add `localhost` to Authorized domains in Firebase Console

**Issue: Google Sign-In popup blocked**
- Solution: Allow popups for localhost in your browser settings

**Issue: "Failed to generate quiz"**
- Solution: Verify your Groq API key is correct

---

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com)
- [Groq Console](https://console.groq.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)

---

## 📧 Need Help?

Check the README.md file for detailed documentation and troubleshooting.
