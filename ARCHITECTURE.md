# 🔄 Application Flow Diagram

## Authentication & Navigation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Opens App                          │
│                      http://localhost:3000                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   app/page.tsx │
                    │  (Home Route)  │
                    └────────┬───────┘
                             │
                    Check Auth State
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
       ┌─────────────┐              ┌──────────────┐
       │ Not Signed  │              │   Signed In  │
       │     In      │              │              │
       └──────┬──────┘              └──────┬───────┘
              │                             │
              │ Redirect                    │ Redirect
              ▼                             ▼
    ┌──────────────────┐          ┌─────────────────────┐
    │  /login          │          │  /dashboard         │
    │                  │          │                     │
    │ 🎨 Beautiful     │          │ 👤 User Profile     │
    │    Login Page    │          │ 📄 Quiz Generator   │
    │                  │          │                     │
    │ [Continue with   │          │ • Upload PDF        │
    │  Google Button]  │          │ • Generate Quiz     │
    └────────┬─────────┘          │ • View Results      │
             │                    │ • Sign Out          │
             │ Click              └─────────┬───────────┘
             ▼                              │
    ┌─────────────────┐                    │ Sign Out
    │ Firebase Auth   │                    │
    │ Google Sign-In  │                    ▼
    │    Popup        │            ┌──────────────┐
    └────────┬────────┘            │ Logout &     │
             │                     │ Redirect to  │
             │ Success             │   /login     │
             ▼                     └──────────────┘
    ┌──────────────────┐
    │ Redirect to      │
    │  /dashboard      │
    └──────────────────┘
```

---

## Quiz Generation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    User on Dashboard Page                        │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 1. Select PDF File   │
                  │    (drag/drop or     │
                  │     file picker)     │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 2. Click "Generate   │
                  │      Quiz" Button    │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 3. Show Loading      │
                  │    Spinner           │
                  └──────────┬───────────┘
                             │
                             ▼
            ┌────────────────────────────────┐
            │  4. POST /api/upload           │
            │     • Validate PDF             │
            │     • Parse PDF (pdf-parse)    │
            │     • Extract text (8000 chars)│
            └────────────┬───────────────────┘
                         │
                         ▼
            ┌────────────────────────────────┐
            │  5. Call Groq API              │
            │     • Model: LLaMA 70B         │
            │     • Send extracted text      │
            │     • Request 5 questions      │
            └────────────┬───────────────────┘
                         │
                         ▼
            ┌────────────────────────────────┐
            │  6. Parse AI Response          │
            │     • Extract JSON             │
            │     • Validate questions       │
            │     • Ensure 4 options each    │
            └────────────┬───────────────────┘
                         │
                         ▼
            ┌────────────────────────────────┐
            │  7. Display Quiz               │
            │     • 5 Questions              │
            │     • 4 Options (A, B, C, D)   │
            │     • Show/Hide Answers Button │
            └────────────┬───────────────────┘
                         │
                         ▼
            ┌────────────────────────────────┐
            │  8. User Actions               │
            │     • Review Questions         │
            │     • Toggle Answers           │
            │     • Upload New PDF           │
            └────────────────────────────────┘
```

---

## Component Hierarchy

```
RootLayout (app/layout.tsx)
│
├─ AuthProvider (contexts/AuthContext.tsx)
│  │
│  ├─ Provides user state
│  ├─ Provides signInWithGoogle()
│  └─ Provides logout()
│
└─ Children Routes
   │
   ├─ / (app/page.tsx)
   │  └─ Redirects based on auth
   │
   ├─ /login (app/login/page.tsx)
   │  ├─ Login UI
   │  ├─ Google Sign-In Button
   │  └─ Feature List
   │
   └─ /dashboard (app/dashboard/page.tsx)
      ├─ Header
      │  ├─ Logo
      │  ├─ User Avatar
      │  ├─ User Name/Email
      │  └─ Sign Out Button
      │
      └─ Main Content
         ├─ Welcome Message
         ├─ File Upload Form
         ├─ Loading Spinner (when generating)
         └─ Quiz Display
            ├─ Question List
            └─ Show/Hide Answers Toggle
```

---

## Data Flow

```
┌──────────────┐
│    User      │
│   Actions    │
└──────┬───────┘
       │
       ▼
┌──────────────┐      ┌─────────────────┐
│  React       │◄────►│  AuthContext    │
│  Components  │      │  (Firebase)     │
└──────┬───────┘      └─────────────────┘
       │                      ▲
       │                      │
       ▼                      │
┌──────────────┐              │
│  API Routes  │              │
│  /api/upload │              │
└──────┬───────┘              │
       │                      │
       ▼                      │
┌──────────────┐     ┌────────┴────────┐
│  PDF Parser  │     │  Firebase Auth  │
│  (pdf-parse) │     │     (Google)    │
└──────┬───────┘     └─────────────────┘
       │
       ▼
┌──────────────┐
│  Groq API    │
│  LLaMA 70B   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Quiz JSON   │
│   Response   │
└──────────────┘
```

---

## Security Layers

```
┌─────────────────────────────────────┐
│         Frontend Security           │
├─────────────────────────────────────┤
│ • Protected Routes (useAuth hook)   │
│ • Client-side auth state checks     │
│ • Automatic redirects               │
│ • Session persistence               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│      Firebase Authentication        │
├─────────────────────────────────────┤
│ • OAuth 2.0 with Google             │
│ • Secure token management           │
│ • Session handling                  │
│ • Authorized domains check          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│         API Security                │
├─────────────────────────────────────┤
│ • Environment variables             │
│ • HTTPS in production               │
│ • CORS configuration                │
│ • File size limits (10MB)           │
└─────────────────────────────────────┘
```

---

## File Upload Process

```
User Selects PDF
       │
       ▼
┌──────────────────┐
│ Validate File    │
│ • Type: PDF      │
│ • Size: < 10MB   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Create FormData  │
│ Append PDF file  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ POST to API      │
│ /api/upload      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Convert to       │
│ Buffer (memory)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Parse with       │
│ pdf-parse        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Extract Text     │
│ (up to 8000 ch.) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Send to LLaMA    │
│ via Groq API     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Return Quiz JSON │
└──────────────────┘
```

---

## State Management

```
AuthContext State:
├─ user: User | null
├─ loading: boolean
├─ signInWithGoogle(): Promise<void>
└─ logout(): Promise<void>

Dashboard State:
├─ file: File | null
├─ loading: boolean
├─ quiz: Quiz | null
├─ showAnswers: boolean
└─ error: string | null

Quiz Interface:
└─ questions: Question[]
   └─ Question:
      ├─ question: string
      ├─ options: string[]
      └─ correct_answer: number
```
