# StartNow

StartNow is an AI-powered contract work platform built for CUNY students and local small businesses. It is a two-sided marketplace that matches verified students with real paid work based on skills, coursework, and employer needs, without relying on unpaid internships, personal networks, or traditional job board filters.

## What It Does

On the employer side, a small business owner posts a project brief with the scope of work, required skills, and available budget. The platform's AI matching system identifies the strongest-fit verified CUNY student and notifies both sides when a match is made.

From there, the platform supports the full contract workflow:

- Students introduce themselves through built-in messaging.
- Both sides align on the scope and expectations before work begins.
- Students complete and submit deliverables directly through the platform.
- Employers review the work, release payment, and leave a rating.

The platform also supports team-based contracts. A matched student can invite one or two other verified CUNY students to collaborate on a project. The employer's budget remains fixed, and the students agree to a payment split before the work starts.

## Trust, Verification, and Accountability

To protect both students and employers, StartNow includes identity verification and platform accountability on both sides:

- Students verify with a CUNY email address.
- Employers verify with a business email address.
- Ratings help surface reliable participants and high-quality work.
- A strike system discourages bad behavior and repeated violations.
- Users who fall below a rating threshold are timed out for 30 days.
- Users who accumulate too many strikes are permanently removed.

This system is designed to create a trusted marketplace where both students and businesses can participate with confidence.

## Why It Matters

StartNow is an equity platform at its core. It exists to address a structural problem that affects many CUNY students, especially first-generation, working, and commuting students who are often excluded from traditional internships and early-career pipelines.

Too often, those opportunities are unpaid, network-dependent, and inaccessible to students who already have jobs, family obligations, or limited time to commute. This platform replaces that model with one that is merit-based, paid, and rooted in the CUNY community.

Every completed contract helps students build a verified portfolio of real client work, ratings, and professional experience. By graduation, students can leave with more than coursework alone. They can leave with proof of execution, proof of trust, and a real track record.

## Core Vision

The long-term goal is to make opportunity more accessible by turning student talent into visible, paid, and verifiable work experience. Instead of waiting for permission through a connection or a traditional internship, students can demonstrate value through real contracts with real local businesses.

In that sense, StartNow works like a marketplace engine for upward mobility: matching talent to need, reducing barriers to entry, and helping students graduate with experience that already counts.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase project (for the database and auth)

### Installation

Clone the repository and install dependencies for both the frontend and backend:

```bash
git clone <repo-url>
cd CUNY-AI-Innovation

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

Create a `.env` file in the `backend/` directory with the following:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

Create a `.env.local` file in the `frontend/` directory with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Running Locally

Open two terminals and run each service:

**Backend** (runs on port 3001):

```bash
cd backend
npm run dev
```

**Frontend** (runs on port 3000):

```bash
cd frontend
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

The frontend talks to the backend at `http://localhost:3001`.
