# CareerForge AI 🚀

An AI-powered full-stack Job Preparation and Interview Strategy platform built with **React**, **Node.js**, **Express**, **MongoDB**, and **Google Gemini AI**.

---

## ✨ Features

- **Resume ATS Parsing**: Extracts candidate text directly from PDF resumes.
- **AI-Powered Gap Analysis**: Compares candidate profile against target job descriptions.
- **Match Score**: Dynamic scoring breakdown based on role alignment and skills.
- **Technical & Behavioral Question Generator**: Role-tailored questions with interviewer intentions and model answers.
- **Personalized Day-by-Day Prep Plan**: Structured roadmap to prepare for your interview.
- **ATS-Optimized Resume Tailoring**: Automatically generates an ATS-friendly resume tailored to the target role.
- **JWT Authentication & Security**: Secure cookie-based authentication with token blacklisting.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, React Router v7, Axios, SCSS
- **Backend**: Node.js, Express, Mongoose, Multer, PDF-Parse, Puppeteer
- **AI & LLM**: Google Gemini API (`@google/genai`)
- **Database**: MongoDB Atlas

---

## 📦 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB Atlas connection URI
- Google Gemini API Key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kyukoten/career-forge-ai.git
   cd career-forge-ai
   ```

2. **Backend Setup**:
   ```bash
   cd Backend
   npm install
   # Create .env based on .env.example
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../Frontend
   npm install
   npm run dev
   ```

---

## 👤 Author

- GitHub: [@kyukoten](https://github.com/kyukoten)
