# TikTok Shop AI Content Starter

Starter project: Next.js + Supabase + OpenAI for generating TikTok Shop content.

## Features

- Email/password auth with Supabase
- Dashboard form
- AI generation API route
- Save generation history to Supabase
- Simple pricing-ready structure

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key
```

## Supabase database

Run `supabase/schema.sql` in Supabase SQL Editor.

## Main routes

- `/` landing page
- `/login` login/register page
- `/dashboard` content generator
- `/api/generate` AI generation endpoint

## Suggested first pricing

- Free: 5 generations/day
- Pro: 99k VND/month
- Agency: 299k VND/month
