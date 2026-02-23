# Copilot Instructions for Dandenong Psychic Site

## Project Overview

This is a full-stack psychic reading services website for Dandenong, featuring:
- **Frontend**: React (Create React App with CRACO) + Tailwind CSS + Shadcn/ui components
- **Backend**: FastAPI (Python) + MongoDB
- **Deployment**: Docker (two-stage build bundling frontend & backend)

## Design Philosophy

### Brand Identity: "E1: The Anti-AI Designer"
- **Tone**: Mystical, Trustworthy, Deep, Empathetic
- **Mission**: Create a digital sanctuary that feels like a midnight conversation with the universe
- **Avoid**: Kitschy 'crystal shop' vibes; aim for 'luxury cosmic consultancy'
- **Principle**: Ancient Astrology × Modern SaaS (Swiss Style)

## Code Style Guidelines

### Frontend (React + Tailwind)

#### Typography
- **Headings (H1-H3)**: Use `Cormorant Garamond, serif` (weights: 400, 600, 700)
  - Letter spacing: `-0.02em`
  - Conveys ancient wisdom and elegance
- **Body Text/UI**: Use `Manrope, sans-serif` (weights: 300, 400, 500)
  - Letter spacing: `0.01em`
- **Technical Labels**: Use `JetBrains Mono, monospace` for dates, coordinates, or astrology data

#### Color Palette: "Midnight Prophecy"
- **Background**: `#0F0C29` (deep midnight blue)
- **Foreground**: `#E2E8F0` (light gray)
- **Primary**: `#7C3AED` (purple)
- **Secondary**: `#F59E0B` (gold/amber)
- **Accent**: `#D946EF` (magenta)
- **Cards**: `rgba(23, 20, 50, 0.6)` with glassmorphism

#### Component Patterns
- **Buttons**: Pill-shaped (`rounded-full`) or sharp with interaction animations
  - Default: `bg-white text-black hover:bg-slate-200 rounded-full px-8 py-6`
  - Outline: `border border-white/20 text-white hover:bg-white/10 rounded-full px-8 py-6`
  - Always include hover scale: `hover:scale-105`
- **Cards**: Glass-morphism style with `backdrop-blur-xl bg-black/40 border border-white/10 shadow-2xl rounded-2xl p-8`
- **Inputs**: `bg-white/5 border-white/10 focus:border-purple-500/50 text-white placeholder:text-white/30 rounded-lg h-12`
- **Navigation**: Floating style with glass background

#### Spacing Rules
- **Section Padding**: `py-24 md:py-32` (generous)
- **Container Padding**: `px-6 md:px-12`
- **Element Gap**: `gap-8`
- **Use 2-3× more spacing than feels comfortable**

#### Icons & Assets
- **Icon Library**: `lucide-react` with stroke width `1.5px`
- **Icon Mapping**:
  - Psychic → Eye
  - Astrology → Star
  - Love → Heart
  - Healing → Sun
  - Chat → MessageCircle
  - Calendar → Calendar

#### Visual Effects
- **Glassmorphism**: `backdrop-blur-xl bg-black/40 border border-white/10`
- **Shadows/Glow**: `0 0 40px -10px rgba(124, 58, 237, 0.3)`
- **Hover States**: `scale-[1.02] brightness-110` + border glow
- **Page Load**: Fade in with slight upward drift (staggered)
- **Accessibility Focus**: Visible purple ring `ring-purple-500 ring-offset-2` on all interactive elements

#### Critical DON'Ts
- ❌ **NEVER** use universal transition (`transition: all`) - breaks transforms
- ❌ **NEVER** center-align the App container (`.App { text-align: center; }`)
- ❌ **NEVER** use dark colors as gradients (they look good independently)
- ❌ **NEVER** use AI emoji characters (🤖🧠) for icons
- ❌ **NEVER** create generic centered layouts with simplistic gradients
- ✅ **DO** create depth through layered z-index hierarchy
- ✅ **DO** use glass-morphism effects (12-24px blur)
- ✅ **DO** add micro-animations for every interaction

#### Component Structure
- Use Shadcn/ui patterns (customized, not raw HTML inputs)
- Components live in `frontend/src/components/` and `frontend/src/components/ui/`
- Pages live in `frontend/src/pages/`
- Always wrap pages with the `Layout` component (includes Navbar + Footer)

#### Notifications
- Use `sonner` library for toasts (already installed)

### Backend (FastAPI + Python)

#### File Structure
- Main server: `backend/server.py`
- Uses `motor.motor_asyncio` for MongoDB
- JWT authentication with `bcrypt` for admin features
- OpenRouter API integration for AI chat

#### Code Patterns
- Use Pydantic models for request/response schemas
- Define models with `BaseModel` from `pydantic`
- Use async/await for all database operations
- Prefix API routes with `/api/`
- Use FastAPI's `HTTPBearer` for JWT authentication

#### Environment Variables
- `MONGO_URL`: MongoDB connection string
- `DB_NAME`: MongoDB database name
- `JWT_SECRET`: Secret for signing JWTs
- `OPENROUTER_API_KEY`: API key for AI chat
- `OPENROUTER_MODEL`: Model to use (default: `meta-llama/llama-3.1-8b-instruct:free`)
- `CORS_ORIGINS`: Allowed origins (default: `*`)

#### Static File Serving
- In production, FastAPI serves compiled React app from `frontend/build/`
- `/api/*` routes are preserved for backend endpoints

## Development Workflow

### Local Development
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001

# Frontend (separate terminal)
cd frontend
yarn install
yarn start  # Runs on http://localhost:3000
```

### Building
```bash
# Frontend only
cd frontend
yarn build

# Docker (full stack)
docker build -t psychic-site .
```

### Testing
```bash
# Frontend
cd frontend
yarn test
```

## Database Schema

### Collections
- `bookings`: User booking records
- `blog_posts`: Blog articles
- `testimonials`: Client testimonials
- `ai_chat_logs`: Chat conversation logs
- `admin_users`: Admin authentication

## Key Features
1. **Booking System**: Calendar-based service booking with form validation
2. **Blog**: Article management with admin dashboard
3. **AI Chat Widget**: OpenRouter-powered spiritual guidance chatbot
4. **Admin Dashboard**: Protected by JWT authentication
   - Dense grid layout, professional dark mode
   - Booking stats, recent queries, revenue widgets

## When Writing New Code

### Frontend Components
1. Check `design_guidelines.json` for specific styling requirements
2. Use existing UI components from `frontend/src/components/ui/`
3. Match the mystical, luxury aesthetic (not kitschy)
4. Ensure WCAG AA contrast compliance
5. Add hover states and micro-animations
6. Test on mobile (responsive breakpoints: `md:`, `lg:`)

### Backend Endpoints
1. Use async functions with `AsyncIOMotorClient`
2. Add proper error handling with `HTTPException`
3. Include request validation with Pydantic models
4. Protect admin routes with JWT bearer token
5. Log important operations

### Accessibility
- Ensure all text meets WCAG AA contrast (use `#CBD5E1` or lighter on dark backgrounds)
- Add `aria-label` attributes to icon-only buttons
- Ensure keyboard navigation works (focus states visible)
- Use semantic HTML elements

## Admin Initialization
First-time setup requires calling `POST /api/init-admin` to create the admin account.

## Useful Commands
- `yarn start` - Start frontend dev server
- `uvicorn server:app --reload` - Start backend dev server
- `docker build` - Build production image
- `yarn build` - Compile frontend for production
