

# Job Tracking System with AI Matching

## Overview
A full-stack job tracking application that fetches real-time jobs from JSearch API, matches them against your resume using AI, tracks application status with smart popups, and includes an AI-powered chat assistant.

---

## Page 1: Authentication & Onboarding
- **Login/Signup** page with email-based authentication via Supabase
- After first login, prompt user to **upload their resume** (PDF/TXT)
- Extract and store resume text in the database
- Users can replace/update their resume anytime from settings
- User profile stores name and resume data

## Page 2: Job Feed (Main Dashboard)
- Fetch real-time jobs from **JSearch API** via Supabase Edge Function
- Display jobs as clean cards showing: title, company, location, description, job type, and **AI match score badge**
- **Color-coded match badges**: Green (>70%), Yellow (40-70%), Gray (<40%)
- **"Best Matches" section** at top showing 6-8 highest scoring jobs
- Each card has an **"Apply" button** that opens the job link in a new tab

### Filters Sidebar
- Search by job title/role
- Multi-select skills filter (React, Node.js, Python, etc.)
- Date posted: Last 24hrs, Last week, Last month, Any time
- Job type: Full-time, Part-time, Contract, Internship
- Work mode: Remote, Hybrid, On-site
- Location search
- Match score filter: High (>70%), Medium (40-70%), All

## Feature: AI Job Matching
- When jobs load, an edge function sends each job description + user's resume to **Lovable AI**
- AI scores each job 0-100% and returns matched skills/experience alignment
- Scores and match explanations are displayed on each job card
- Results cached to avoid redundant API calls

## Feature: Smart Application Tracking Popup
- When user clicks "Apply", the app records the job and opens the link
- On returning to the app (tab focus), a **confirmation popup** appears:
  - "Did you apply to [Job Title] at [Company]?"
  - Options: **"Yes, Applied"** | **"No, just browsing"** | **"Applied Earlier"**
- If confirmed, saves application with timestamp and status "Applied"

## Page 3: Applications Dashboard
- View all tracked applications in a **timeline/kanban view**
- Status pipeline: **Applied → Interview → Offer / Rejected**
- Users can manually update status of each application
- Filter by status stage
- Shows application date, company, job title, and current status

## Feature: AI Sidebar Assistant
- Floating chat button that opens an **AI-powered sidebar**
- Understands natural language queries about jobs:
  - "Show me remote React jobs"
  - "Which jobs have highest match scores?"
  - "Find senior roles posted this week"
- Also answers product questions:
  - "How do I upload my resume?"
  - "Where do I see my applications?"
- Powered by Lovable AI via edge function

## Technical Architecture
- **Frontend**: React + Tailwind + shadcn/ui components
- **Backend**: Supabase (auth, database, edge functions, secrets)
- **Job API**: JSearch via RapidAPI (key stored as Supabase secret)
- **AI**: Lovable AI gateway for matching scores and chat assistant
- **Database tables**: profiles, resumes, applications, chat_messages

