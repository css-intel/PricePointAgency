# PricePoint Agency

A premium business advisory platform built with React, TypeScript, and Tailwind CSS.

## Features

- **Advisory Call Booking**: Book live video sessions in 15-minute increments with automatic refunds for unused time
- **AI-Powered Advisory Chat**: $14/month subscription for unlimited business consulting chat
- **Stripe Integration**: Secure payment processing for bookings and subscriptions
- **Admin Dashboard**: Manage users, bookings, pricing, and settings
- **Responsive Design**: Clean, professional UI optimized for all devices

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **AI**: OpenAI GPT-4
- **Hosting**: Netlify

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd PricePointAgency
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment example and fill in your values:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (for functions)
   - `OPENAI_API_KEY`: Your OpenAI API key

5. Start the development server:
   ```bash
   npm run dev
   ```

## Supabase Database Setup

Create the following tables in your Supabase project:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_subscribed BOOLEAN DEFAULT FALSE,
  subscription_expires_at TIMESTAMP,
  stripe_customer_id TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  duration_minutes INTEGER NOT NULL,
  price_paid INTEGER NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending',
  actual_duration_minutes INTEGER,
  refund_amount INTEGER,
  stripe_payment_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Deploying to Netlify

1. Push your code to GitHub

2. Connect your repository to Netlify

3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

4. Add environment variables in Netlify dashboard

5. Deploy!

## Project Structure

```
src/
├── components/       # Reusable UI components
├── config/          # Configuration files
├── context/         # React context providers
├── lib/             # Utility libraries (Supabase, Stripe, OpenAI)
├── pages/           # Page components
│   └── admin/       # Admin dashboard pages
├── store/           # Zustand state stores
├── App.tsx          # Main app component
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## Pricing Model

- **Advisory Calls**: $35 per 15-minute block
  - 15 minutes: $35
  - 30 minutes: $70
  - 45 minutes: $105
  - 60 minutes: $140
  
- **Advisory Chat**: $14/month subscription
  - Unlimited conversations
  - 24/7 availability
  - Business-focused AI advisor

## License

Private - All rights reserved
