# UniPost AI

A modern, AI-powered SaaS platform for creators to publish content across multiple social media platforms from one unified dashboard.

## Features

- 🎨 **Beautiful UI**: Adobe-level design with glassmorphism and neon accents
- 🤖 **AI-Powered Captions**: Generate engaging captions optimized for each platform
- 📱 **Multi-Platform Publishing**: Publish to Instagram, Twitter, LinkedIn, Facebook, and more
- 📊 **Analytics Dashboard**: Track performance across all platforms with unified analytics
- ⏰ **Smart Scheduling**: Schedule posts at optimal times for each platform
- 🎯 **Creator-First**: Built by creators, for creators

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── dashboard/          # Dashboard pages
│   │   ├── analytics/      # Analytics page
│   │   ├── create/         # Create post page
│   │   └── settings/       # Settings page
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   ├── dashboard/          # Dashboard components
│   │   ├── sidebar.tsx     # Sidebar navigation
│   │   └── header.tsx      # Dashboard header
│   └── ui/                 # UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── textarea.tsx
└── lib/
    └── utils.ts            # Utility functions
```

## Design System

### Color Palette

- **Neon Cyan**: `#00f0ff` - Primary actions and highlights
- **Neon Purple**: `#b026ff` - Secondary accents
- **Neon Pink**: `#ff00ff` - Tertiary accents
- **Neon Green**: `#00ff88` - Success states
- **Neon Blue**: `#0066ff` - Information states

### Theme

- Dark background with glassmorphism effects
- Neon highlights with glow effects
- Minimal but premium aesthetic
- Creator-focused UX

## License

MIT
