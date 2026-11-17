# CareerForge AI 🚀

An intelligent, full-stack AI platform designed to accelerate tech interview preparation and maximize resume ATS pass rates. Built with **React 19**, **Node.js**, **Express**, **MongoDB**, and **Google Gemini 2.5 Flash**.

---

## 🌟 Standout Features

### 🎯 1. Interactive Mock Interview Simulator & AI STAR Grader
- **Practice Mode**: Test your verbal and written responses directly on tailored technical and behavioral questions.
- **Built-in Stopwatch Timer**: Paces responses to match real-world interview timing (~2 minutes).
- **STAR Framework Evaluation**: Gemini analyzes answers for **Situation**, **Task**, **Action**, and **Result** compliance.
- **Scoring & Constructive Feedback**: Instant objective score (0–100), key strengths, actionable improvements, and an exemplary revised answer.

### 📊 2. Deep ATS Resume Analytics & Keyword Matrix
- **Multi-Factor Scoring**:
  - **Keyword Alignment %**: Density and relevancy of job-specific keywords.
  - **Technical Skills %**: Required stack, tools, and framework match.
  - **Soft Skills & Impact %**: Teamwork, communication, and ownership signals.
  - **Experience & Scope %**: Seniority and depth alignment.
- **Keyword Matrix**:
  - 🟢 **Matched Keywords**: Critical terms already present in the candidate's profile.
  - ⚠️ **Critical Missing Keywords**: High-priority terms to add to pass automated ATS filters.
- **Actionable ATS Recommendations**: Specific checklist to optimize resume bullet points and formatting.

### 📄 3. In-Memory Resume Parsing & ATS Resume Builder
- **Zero-Disk Streaming**: `multer` streams PDF buffers directly into `pdf-parse`, extracting text securely in memory.
- **Tailored Resume Generator**: Generates an ATS-friendly, job-tailored resume converted to downloadable PDF via Puppeteer.

### 🔐 4. Production-Grade Authentication & Security
- Password hashing with **`bcryptjs`** (salt rounds = 10).
- Session tokens signed with **`JWT_SECRET`** and delivered through secure HTTP-only cookies.
- **Token Blacklisting**: Revokes active JWT sessions in MongoDB upon logout to prevent replay attacks.
- Client-side protected route wrappers with auto-session restoration.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, React Router v7, Axios, SCSS (Dark Glassmorphism UI)
- **Backend**: Node.js, Express, Mongoose, Multer, PDF-Parse, Puppeteer
- **AI & LLM**: Google Gemini API (`@google/genai` with structured Zod JSON schemas and model fallbacks)
- **Database**: MongoDB Atlas

---

## 📦 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB Atlas connection URI
- Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kyukoten/career-forge-ai.git
   cd career-forge-ai
   ```

2. **Backend Setup**:
   ```bash
   cd Backend
   npm install
   ```
   Create `.env` inside `Backend/`:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_super_secret_jwt_key
   GEMINI_API_KEY=your_google_gemini_api_key
   FRONTEND_URL=http://localhost:5173
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../Frontend
   npm install
   npm run dev
   ```
   Open **`http://localhost:5173`** in your browser.

---

## 👤 Author

- GitHub: [@kyukoten](https://github.com/kyukoten)
