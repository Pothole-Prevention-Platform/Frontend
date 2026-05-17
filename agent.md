# AGENTS.md

## Project Overview

This repository is the frontend for an AI-based pothole risk prediction and reporting platform.

Project name:
- Pothole Prevention Platform Frontend

Competition context:
- This is for a Korean public transportation / land infrastructure competition.
- The product should look like a serious public-safety, mobility, and smart-city service.
- The UI must be polished enough for a contest demo, not just a basic CRUD app.

Main service story:
- Users do not know where to report potholes.
- Even after reporting, responsibility can be passed between agencies.
- Vehicle damage compensation is difficult.
- This service predicts pothole risk with public data, lets citizens report with photos, uses AI to judge whether the image is a real pothole, connects the report to the responsible agency, and helps create compensation documents.

Primary users:
- Delivery riders
- General drivers
- Vehicle damage victims
- Local government road maintenance staff

Primary language:
- All visible UI text must be Korean.
- Code, filenames, and comments may be English.

---

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

If the repository is empty or does not have a frontend setup, create a Vite React TypeScript project in the current repository without deleting the `.git` folder.

---

## Setup Commands

Use these commands for local development:

```bash
npm install
npm run dev
npm run build
```

---

## Autonomous Execution Policy

Codex must not ask the user clarifying questions during implementation.

When requirements are ambiguous, Codex must:
- Make the most reasonable assumption based on this AGENTS.md file.
- Continue implementation immediately.
- Document the assumption in the final response.
- Prefer a complete working mock implementation over stopping to ask questions.

Codex must not stop and ask questions such as:
- "Do you want me to proceed?"
- "Which option do you prefer?"
- "Should I create this file?"
- "Should I install this package?"
- "Do you want Tailwind or CSS?"
- "Do you want mock data or backend integration?"

Default decisions:
- Use React + TypeScript + Vite.
- Use Tailwind CSS.
- Use React Router when multiple pages are needed.
- Use lucide-react for icons.
- Use mock data only.
- Do not use real backend APIs.
- Do not use real AI APIs.
- Do not use paid services.
- Do not use Supabase, Firebase, Next.js, or CRA.
- If data is missing, create realistic Korean mock data.
- If design details are missing, create a polished public-safety / smart-city style UI.
- If routing is missing, create sensible routes.
- If components are missing, create them.
- If assets are missing, use clean icon-based placeholders.

Codex may only stop to ask the user when:
- A destructive action is required, such as deleting major project files.
- A paid service, secret key, or real credential is required.
- The task is impossible without access that is not available.
- The requested action conflicts with this AGENTS.md file.

Otherwise, Codex must proceed without asking.
