# JobAlignAI – AI-Powered Job Tracking & Matching System

## 🚀 Overview

JobAlignAI is a full-stack job tracking platform that fetches real-time job listings, matches them against a user's resume using AI, and helps track applications with an intelligent workflow system.

The application combines real-time job data, AI-powered resume matching, and application management into a single streamlined experience.

---

## 🔐 Authentication & Onboarding

- Secure email authentication using Supabase Auth
- Resume upload (PDF/TXT) during onboarding
- Resume text extraction and storage
- Resume replacement/update from user settings
- User profile management

---

## 💼 Job Feed Dashboard

- Real-time job listings fetched via JSearch API (through Supabase Edge Functions)
- Clean card-based UI displaying:
  - Job title
  - Company
  - Location
  - Description
  - Job type
  - AI match score

### 🎯 AI Match Scoring

Each job is evaluated against the user’s resume using AI:

- Match score (0–100%)
- Skill alignment analysis
- Explanation of compatibility
- Cached results for performance optimization

#### Match Badge Colors
- 🟢 Green – High match (>70%)
- 🟡 Yellow – Medium match (40–70%)
- ⚪ Gray – Low match (<40%)

A **Best Matches** section highlights top-scoring roles.

---

## 🔎 Advanced Filtering

Users can filter jobs by:

- Role / Job title
- Skills (multi-select)
- Date posted
- Job type (Full-time, Contract, Internship, etc.)
- Work mode (Remote, Hybrid, On-site)
- Location
- Match score range

---

## 📌 Smart Application Tracking

When a user clicks “Apply”:

1. The job link opens in a new tab.
2. On returning, a smart popup asks:
   - "Did you apply to this job?"
3. Application status is saved automatically.

### Application Pipeline

Applications move through stages:
Applied → Interview → Offer / Rejected

Users can manually update status from the dashboard.

---

## 📊 Applications Dashboard

- Kanban-style or timeline view
- Filter by status stage
- View application history
- Track company, job title, and date applied

---

## 🤖 AI Sidebar Assistant

An AI-powered chat assistant that:

- Answers job search queries:
  - “Show me remote React jobs”
  - “Which jobs have highest match scores?”
- Answers product-related questions:
  - “How do I upload my resume?”
  - “Where can I see my applications?”

Powered via Supabase Edge Functions and AI API integration.

---

## 🏗 Technical Architecture

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Backend
- Supabase (Authentication + Database)
- Supabase Edge Functions
- Secure API key management

### External Integrations
- JSearch API (via RapidAPI)
- AI matching engine

---

## 🗄 Database Tables

- `profiles`
- `resumes`
- `applications`
- `chat_messages`

---

## ⚙️ Local Development

```bash
git clone https://github.com/yourusername/jobalignai.git
cd jobalignai
npm install
npm run dev

🌍 Deployment
Frontend: Vercel
Backend & Database: Supabase
Edge Functions: Supabase CLI

📌 Future Improvements
Email reminders for application follow-ups
Resume improvement suggestions via AI
Interview preparation assistant
Analytics dashboard for job search insights