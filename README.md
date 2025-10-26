# 📄 PDF Quiz Generator

A lightweight Next.js web application that generates quiz questions from PDF files using LLaMA 70B via Groq API with Firebase Authentication.

## ✨ Features

- � **Firebase Authentication**: Secure Google Sign-In
- �📤 **PDF Upload**: Simple drag-and-drop or file picker interface
- 🤖 **AI-Powered**: Uses LLaMA 3.1 70B model via Groq for intelligent quiz generation
- 📝 **Smart Quizzes**: Generates 5 multiple-choice questions with 4 options each
- ✅ **Answer Toggle**: Show/hide correct answers on demand
- 🎨 **Beautiful UI**: Clean, responsive design with Tailwind CSS
- 🌙 **Dark Mode**: Automatic dark mode support
- ⚡ **No Storage**: Processes PDFs in memory - no file storage needed
- 👤 **User Dashboard**: Personalized dashboard with user profile

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Groq API key (free tier available at [console.groq.com](https://console.groq.com))
- A Firebase project with Google Sign-In enabled

### Installation

1. **Clone or navigate to the project directory**

2. **Install dependencies**
   ```bash
   bun install
   # or npm install
   ```

3. **Set up Firebase**
   
   a. Go to [Firebase Console](https://console.firebase.google.com)
   
   b. Create a new project or use an existing one
   
   c. Enable Google Sign-In:
      - Go to Authentication > Sign-in method
      - Enable "Google" provider
      - Add your authorized domain (localhost for development)
   
   d. Get your Firebase config:
      - Go to Project Settings > General
      - Scroll to "Your apps" section
      - Click "Web" app or create one
      - Copy the configuration values

4. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your keys:
   ```env
   # Groq API Key
   GROQ_API_KEY=your_groq_api_key_here
   
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```
   
   **To get a free Groq API key:**
   - Visit [console.groq.com](https://console.groq.com)
   - Sign up for a free account
   - Go to API Keys section
   - Create a new API key

5. **Run the development server**
   ```bash
   bun dev
   # or npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

1. **Sign In**: Click "Continue with Google" on the login page
2. **Upload a PDF**: Drag and drop or select a PDF file (max 10MB)
3. **Generate Quiz**: Click "Generate Quiz" button
4. **Wait**: The AI will process the PDF and generate questions (usually takes 10-30 seconds)
5. **Review**: View the generated quiz with 5 multiple-choice questions
6. **Check Answers**: Toggle the "Show Answers" button to reveal correct answers
7. **Try Another**: Click "Upload New PDF" to generate another quiz
8. **Sign Out**: Click the sign out button in the header when done

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication (Google Sign-In)
- **PDF Processing**: pdf-parse (in-memory parsing)
- **AI Model**: LLaMA 3.1 70B Versatile via Groq SDK
- **API**: Next.js API Routes

## 📁 Project Structure

```
fin_in/
├── app/
│   ├── api/
│   │   └── upload/
│   │       └── route.ts       # API endpoint for PDF processing
│   ├── dashboard/
│   │   └── page.tsx           # Protected dashboard page
│   ├── login/
│   │   └── page.tsx           # Login page with Google Sign-In
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout with AuthProvider
│   └── page.tsx               # Home page (redirects)
├── contexts/
│   └── AuthContext.tsx        # Firebase auth context
├── lib/
│   └── firebase.ts            # Firebase configuration
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## 🔧 Configuration

### Firebase Security Rules

For production, set up Firestore security rules in Firebase Console if you plan to store user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### API Route Configuration

The API route (`/api/upload`) is configured to:
- Accept files up to 10MB
- Process PDFs in memory (no disk storage)
- Extract up to 8000 characters of text
- Use LLaMA 3.1 70B Versatile model
- Generate exactly 5 questions

### Groq Model Settings

Current configuration:
- **Model**: `llama-3.1-70b-versatile`
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 2000
- **Top P**: 1

You can adjust these in `app/api/upload/route.ts` if needed.

## 🎯 Features Breakdown

### Authentication (`contexts/AuthContext.tsx`)
- Firebase Google Sign-In integration
- User state management
- Protected routes
- Auto-redirect for authenticated/unauthenticated users

### Login Page (`app/login/page.tsx`)
- Beautiful gradient design
- Google Sign-In button with logo
- Feature highlights
- Responsive layout

### Dashboard (`app/dashboard/page.tsx`)
- User profile display with photo
- File upload with validation
- Loading states with spinner
- Error handling and display
- Quiz rendering with styled options
- Answer reveal toggle
- Sign out functionality
- Responsive design

### Backend (`app/api/upload/route.ts`)
- PDF file validation (type, size)
- In-memory PDF parsing
- Text extraction and truncation
- Groq API integration
- JSON response parsing and validation
- Comprehensive error handling

## 🐛 Troubleshooting

### Authentication Issues

**"Failed to sign in"**
- Ensure Google Sign-In is enabled in Firebase Console
- Check that your domain is authorized in Firebase settings
- Verify all Firebase environment variables are correct
- Clear browser cache and cookies

**"Unauthorized domain"**
- In Firebase Console, go to Authentication > Settings > Authorized domains
- Add `localhost` for development
- Add your production domain when deploying

### Quiz Generation Issues

**"Failed to generate quiz"**
- Check your Groq API key is correct in `.env`
- Ensure your Groq account has available credits
- Check internet connection

**"PDF does not contain enough text"**
- Upload a PDF with more textual content (minimum ~100 characters)
- Scanned PDFs without OCR won't work

**"Failed to parse PDF file"**
- Ensure the file is a valid PDF
- Try a different PDF file
- Check file isn't corrupted or password-protected

### Environment Variables

**"Firebase not initialized"**
- Ensure all `NEXT_PUBLIC_FIREBASE_*` variables are set in `.env`
- Restart the development server after updating `.env`
- Check for typos in environment variable names

## 📝 License

MIT License - feel free to use this project however you'd like!

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com) for authentication services
- [Groq](https://groq.com) for providing fast LLaMA inference
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) for PDF text extraction
- [Next.js](https://nextjs.org) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for beautiful styling

---

Built with ❤️ using Next.js, Firebase, and LLaMA 70B
