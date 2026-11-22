# WeCan - AI Interview & Career Platform

Professional, high-utility, high-fidelity AI Interview Coach designed for elite career development.

## 🚀 Features
- **Resume Forensic Auditor**: ATS optimization and quantifiable impact analysis.
- **Mock Interview Simulator**: Voice-first adversarial interview sessions.
- **Q&A Generator**: Domain-specific question synthesis.
- **Study Vault**: Progressive learning paths based on target roles.

## 🛠️ Local Development

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env` and provide your `GEMINI_API_KEY`.
   ```bash
   cp .env.example .env
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`.

## 🔥 Firebase Setup

This application uses Firebase for data persistence. Ensure you create the following **Firestore Collections**:

### 1. `users`
- **Path**: `/users/{userId}`
- **Stores**: Core user profile metadata.
- **Fields**: `uid`, `email`, `targetRole`, `experienceLevel`, `readinessScore`.

### 2. `resumes`
- **Path**: `/users/{userId}/resumes/current`
- **Stores**: The user's latest ATS-optimized resume.
- **Fields**: `education`, `experience`, `skills`, `projects`, `optimizedContent`, `atsScore`, `aiSuggestions`.

### 3. `interviews`
- **Path**: `/users/{userId}/interviews/{sessionId}`
- **Stores**: History of mock interview sessions.
- **Fields**: `sessionId`, `timestamp`, `mode`, `history` (Array), `feedback`, `score`.

### 4. `qa_sessions`
- **Path**: `/users/{userId}/qa_sessions/{sessionId}`
- **Stores**: Generated sets of interview questions and answers.
- **Fields**: `id`, `targetRole`, `questions` (Array), `createdAt`.

### 5. `studyPlans`
- **Path**: `/users/{userId}/studyPlans/current`
- **Stores**: Personalized learning curriculum.
- **Fields**: `topics` (Array).

### Authentication
Enable **Google Authentication** in the Firebase Console under "Authentication" > "Sign-in method".

---

## 📦 Deployment

### Vercel
1. Push your code to a GitHub repository.
2. Connect the repository to Vercel.
3. Configure the following **Environment Variables** in the Vercel dashboard:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
4. Vercel will auto-detect the Vite configuration and deploy the app.

### Manual Build
To generate static files for any host:
```bash
npm run build
```
The output will be in the `dist/` directory.

## 🔑 Environment Variables
This application requires a **Gemini API Key** from Google AI Studio. 
Ensure `GEMINI_API_KEY` is set in your environment during build (for Vercel) or in a `.env` file (for localhost).
