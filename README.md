# WeCan — AI Interview Coach & Career Placement Platform

> **WeCan** is an enterprise-grade AI technical career preparation platform designed to help students, new graduates, and software engineers master high-stakes technical interviews, optimize their credentials for Applicant Tracking Systems (ATS), and accelerate their placement trajectory.

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/Srushh963/wecan)
[![Tests](https://img.shields.io/badge/Tests-100%25%20Passing-brightgreen)](https://github.com/Srushh963/wecan)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/Supabase-RLS%20Enforced-emerald)](https://supabase.com)
[![AI Engine](https://img.shields.io/badge/Groq-High--Throughput%20Inference-orange)](https://groq.com)

---

## 🎯 Problem Statement & Alignment

### Problem:
Technical placement preparation for engineering students is fundamentally fragmented:
1. **Mock interviews** lack realistic adversarial pressure; human mock platforms are cost-prohibitive.
2. **ATS screening** filters out 75%+ of candidate resumes before an engineer ever reads them due to keyword gaps and formatting mismatches.
3. **Coding practice** on standard platforms gives compiler errors without senior-engineer code review feedback on Big-O complexity, edge cases, and architectural alternatives.
4. **Offer negotiation** is opaque, leaving fresh graduates unaware of realistic market compensation brackets and negotiation levers.

### Solution:
**WeCan** unifies the entire technical hiring lifecycle into an intelligent command center:
- **Calibrate:** Map domain, target role, and experience level.
- **Practice:** Voice-first adversarial mock interviews + multi-language algorithmic coding.
- **Audit & Build:** ATS forensic resume scanning, voice-assisted resume synthesis, and tailored cover letters.
- **Evaluate & Track:** Readiness score velocity, speech cadence, and domain test tracking.
- **Export:** One-tap executive PDF generation directly to the device's Downloads folder.

---

## 🚀 Key Modules & Capabilities

| Module | Core Functionality | Impact |
| :--- | :--- | :--- |
| **1. Onboarding** | Profile target calibration (`role`, `domain`, `experience`, `target_job`) | Initializes AI persona parameters |
| **2. Voice Resume Builder** | Voice-driven resume compilation via speech recognition | Generates structured ATS-ready resumes |
| **3. ATS Structural Scanner** | Forensic resume matching against target job descriptions | Uncovers missing keywords & suggests XYZ bullet points |
| **4. Practice Q&A** | Domain-specific technical & behavioral question synthesis | Prepares ideal STAR answers & criteria |
| **5. Written Assessments** | Timed examinations testing framework internals & edge cases | Evaluates core engineering fundamentals |
| **6. Live Coding Arena** | Multi-language sandbox (JS, Python, C++, Java) with instant AI review | Analyzes Big-O complexity & missed edge cases |
| **7. Mock Interview Simulator** | Voice-first adversarial interviewer ("The Architect") | STAR scoring, pronunciation, pace & clarity |
| **8. Cover Letter Architect** | Role-tailored cover letters with configurable tone | Authentic, high-converting application assets |
| **9. Career & Salary Compass** | Real-world market salary bands (Entry, Mid, Unicorn) | Negotiation tactics & high-value tech roadmaps |
| **10. Resource Hub** | Adaptive learning suggestions based on candidate test weaknesses | Closes skill gaps dynamically |
| **11. Performance Vault** | Visual analytics tracking readiness curves and competency scores | Data-driven placement readiness |

---

## 🔒 Security & Data Architecture

- **Supabase Authentication & Row-Level Security (RLS)**: Enforces `auth.uid() = user_id` across all tables (`profiles`, `resumes`, `tests`, `study_plans`, `qa_sessions`, `interviews`). Users cannot access, modify, or list records belonging to other candidates.
- **Zero Secret Leakage**: Environment keys are kept strictly out of git history (`.gitignore` protects all `.env` files).
- **Safe Audio Handling**: Global lifecycle management ensures speech synthesis and audio buffers are immediately cancelled when navigating between sections.

---

## 🧪 Testing & Code Quality

The repository includes a unit and integration test suite using **Vitest** and **React Testing Library**:
```bash
# Run all automated tests
npm test
```
- Tests cover sound manager lifecycle, report file download triggering, and AI model configurations.
- Modular code architecture separates presentation cards from business logic.

---

## 🛠️ Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Srushh963/wecan.git
   cd wecan
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and provide your credentials:
   ```env
   VITE_GROQ_API_KEY="your_groq_api_key_here"
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_PUBLISHABLE_KEY="your_publishable_key_here"
   APP_URL="http://localhost:3000"
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Production Build**:
   ```bash
   npm run build
   ```

---

## 👥 Demo Account Credentials
- **Email**: `demo@wecan.ai`
- **Password**: `Password123!`
*(Pre-loaded with 5 historical assessments, 87% ATS resume audit, completed system design mock interview, and personalized study curriculum).*
