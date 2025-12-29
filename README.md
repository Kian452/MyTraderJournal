# MyTradingJournal

A trading journal web application built with Next.js, TypeScript, and PostgreSQL.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **PostgreSQL**
- **NextAuth** (Credentials-based authentication)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy the environment variables file:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
   - Set `NEXTAUTH_SECRET` to a secure random string
   - Set `DATABASE_URL` to your PostgreSQL connection string

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

For testing purposes, you can use:
- Email: `demo@example.com`
- Password: `demo123`

## Project Structure

```
├── app/
│   ├── api/          # API routes
│   ├── auth/         # Authentication pages
│   ├── dashboard/    # Protected dashboard
│   └── layout.tsx    # Root layout
├── components/       # React components
├── lib/             # Utility functions
│   ├── auth.ts      # NextAuth configuration
│   ├── db.ts        # Database connection
│   └── i18n.ts      # Internationalization setup
└── middleware.ts    # Route protection
```

## Features

- ✅ Authentication with NextAuth
- ✅ Protected routes
- ✅ Responsive navigation
- ✅ Internationalization structure (prepared)
- 🔄 User registration (placeholder)
- 🔄 Database models (to be implemented)
- 🔄 Trading journal features (to be implemented)

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Next Steps

- Implement user registration with database
- Create database schema for trades and journals
- Build trading journal UI
- Add analytics and reporting features
- Implement full internationalization support

