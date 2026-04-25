# CLAUDE.md

This repository is for `StartNow`, an AI-powered contract work platform that connects verified CUNY students with paid project work from local small businesses.

## Product Context

The platform is a two-sided marketplace:

- Employers post project briefs with scope, skills, and budget.
- The platform matches the best-fit verified CUNY student.
- Students and employers communicate through built-in messaging.
- Students submit work through the platform.
- Employers review deliverables, release payment, and leave ratings.

The platform also supports:

- Team contracts with one to two additional student collaborators
- Locked payment splits before work begins
- CUNY email verification for students
- Business email verification for employers
- Ratings, strikes, temporary timeouts, and permanent removal for abuse
- Portfolio building through completed client work

This product should feel practical, trustworthy, ambitious, and distinctly built for upward mobility in the CUNY ecosystem.

## Repository Structure

- `frontend/`: Next.js 14 app router frontend
- `backend/`: TypeScript backend service
- `README.md`: project overview and mission

## Frontend Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Radix UI primitives
- Supabase client and server helpers

## Frontend Guidance

When working in `frontend/`, prefer:

- Server-first Next.js patterns where reasonable
- Clear role-based flows for students and employers
- Reusable UI primitives from `frontend/components/ui/`
- Consistent spacing, strong hierarchy, and mobile-friendly layouts
- Product copy that is direct, credible, and opportunity-focused

Avoid:

- Generic startup buzzword copy
- Overdesigned dashboards that hide the core actions
- Visual styles that feel corporate, cold, or unrelated to student advancement
- Breaking existing route structure unless necessary

## Design Direction

Design for trust, momentum, and accessibility.

- Students should feel that the platform is opening a real door.
- Employers should feel that the platform is reliable and easy to use.
- Interfaces should emphasize clarity, legitimacy, and progress toward paid work.
- Portfolio, ratings, verification, and project status should feel tangible and motivating.

Preferred tone:

- Clear
- Confident
- Supportive
- Mission-driven

## Important User Flows

Keep these flows easy to understand and easy to complete:

1. Student signup and verification
2. Employer signup and verification
3. Employer brief posting
4. AI match notification
5. Student introduction and project alignment
6. Workspace and deliverable submission
7. Employer review and payment release
8. Rating, strike, and portfolio updates

## If You Are Making UI Changes

Before making major design changes:

- Check whether the screen is for students, employers, or shared workflow
- Preserve the product's marketplace logic
- Make primary actions obvious
- Keep trust indicators visible
- Make sure layouts work on mobile and desktop

If adding new UI, prefer components and patterns that can scale across:

- Student dashboard
- Employer dashboard
- Brief pages
- Portfolio pages
- Workspace and review flows

## Running the App

Frontend:

```bash
cd frontend
npm run dev
```

Backend:

```bash
cd backend
npm run dev
```
