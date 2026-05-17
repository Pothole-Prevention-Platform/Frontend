# AGENTS.md

## Project Overview

This repository is the frontend for an AI-based pothole risk prediction and reporting platform.

Project name:
- Pothole Prevention Platform Frontend

Competition context:
- This is for a Korean public transportation / land infrastructure competition.
- The product should look like a serious public-safety, mobility, smart-city, and government-tech service.
- The UI must be polished enough for a contest demo, not just a basic CRUD app.

Main service story:
- Users do not know where to report potholes.
- Even after reporting, responsibility can be passed between agencies.
- Vehicle damage compensation is difficult.
- This service predicts pothole risk with public data, lets citizens report with photos, uses AI to judge whether the image is a real pothole, connects the report to the responsible agency, and helps create compensation claim draft documents.

Primary users:
- 배달 라이더
- 일반 운전자
- 피해 차주
- 지자체 담당자

Primary language:
- All visible UI text must be Korean.
- Code, filenames, and comments may be English.

## Tech Stack

Use this stack unless the existing repository already uses something clearly different:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- lucide-react for icons
- npm as the package manager

Do not use:
- Next.js
- CRA
- Firebase
- Supabase
- Real backend integration
- Real map API
- Real AI API
- Any paid API

Use mock data only for now.

## Setup Commands

Use these commands for local development:

npm install
npm run dev
npm run build

If lint script exists:

npm run lint

If typecheck script exists:

npm run typecheck

If typecheck script does not exist and TypeScript is configured, add this script to package.json:

"typecheck": "tsc --noEmit"

Always run at least:

npm run build

before finishing a major task.

## Frontend Harness Requirements

Before implementing detailed pages, set up a frontend harness that makes design work easy.

The harness must include:

1. Routing harness
   - All major pages must be reachable by URL.
   - Navigation links must work.
   - No backend is required.

2. Mock data harness
   - Put demo data in src/data/mockData.ts.
   - Use typed mock data.
   - Mock pothole risk zones, reports, agencies, compensation records, weather alerts, and admin dashboard rows.

3. Layout harness
   - Public pages use a minimal public layout.
   - Auth pages use an auth layout.
   - Main service pages use an app layout with sidebar/header.
   - Admin page can use the same app layout but should feel like a dashboard.

4. Design system harness
   - Create reusable UI components.
   - Do not repeat card/button/badge styles everywhere.
   - Create reusable components such as Button, Card, Badge, Input, StatCard, SectionHeader, RiskBadge, EmptyState.

5. Responsive harness
   - Web-first responsive layout.
   - Desktop target: 1440px
   - Laptop target: 1280px
   - Tablet target: 768px
   - Mobile target: 390px
   - Sidebar should collapse or become bottom/nav style on smaller screens.

## Required Routes

Create these routes:

/                       -> LoadingPage
/onboarding             -> InitialSetupPage
/auth/login             -> LoginPage
/auth/signup            -> SignupPage
/risk-map               -> AI Risk Prediction Map Page
/report                 -> Citizen Report Page
/report/ai-review       -> AI Photo Judgement Result Page
/agency                 -> Responsible Agency + Compensation Page
/alerts                 -> Real-time Risk Alert Page
/admin                  -> Local Government B2B Dashboard Page
/dev/components         -> Component Preview Page

If / is used as a loading page, provide a button or link to /onboarding.

## Coding Rules

- Use TypeScript.
- Avoid any.
- Use typed props.
- Use reusable components.
- Keep components readable for beginner developers.
- Prefer simple, understandable code over clever abstractions.
- Do not over-engineer.
- Do not create backend logic.
- Do not store secrets.
- Do not create .env with real keys.
- Do not install unnecessary dependencies.
- If adding dependencies, explain why in the final summary.

## Accessibility Rules

- Buttons must be actual button elements or links.
- Inputs must have labels.
- Images/placeholders must have accessible text.
- Color must not be the only way to understand risk level.
- Add visible text labels for risk states.
