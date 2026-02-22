# Best Astrologer Dandenong - Website

Professional website for psychic and astrology services with AI-powered chat, online booking, and admin dashboard.

## Features

- **Homepage** - Stunning mystical design with services and testimonials
- **Online Booking** - Calendar-based appointment scheduling
- **AI Chat** - 24/7 customer support powered by GPT-5.2
- **Blog** - SEO-optimized articles for each service
- **Contact Form** - Capture customer enquiries
- **Admin Dashboard** - Manage bookings, queries, and view analytics

## Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **AI**: OpenAI GPT-5.2 via Emergent Integrations

## Environment Variables

Set these in Railway (or your hosting platform):

```
# Required
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname
DB_NAME=astrologer_db
EMERGENT_LLM_KEY=your_emergent_key
JWT_SECRET=your_secure_random_string

# Optional
CORS_ORIGINS=https://yourdomain.com
```

## Deploy to Railway

### Option 1: One-Click Deploy
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

### Option 2: Manual Deploy

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/astrologer-website.git
   git push -u origin main
   ```

2. **Create Railway Project**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

3. **Add MongoDB**
   - In Railway, click "New" → "Database" → "MongoDB"
   - Copy the `MONGO_URL` connection string

4. **Set Environment Variables**
   - Go to your service → "Variables"
   - Add all required environment variables

5. **Deploy**
   - Railway will automatically build and deploy
   - Your site will be live at `https://yourproject.up.railway.app`

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)

### Setup

1. **Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env  # Edit with your values
   uvicorn server:app --reload --port 8001
   ```

2. **Frontend**
   ```bash
   cd frontend
   yarn install
   yarn start
   ```

## Admin Access

Default credentials (change in production):
- **Username**: admin
- **Password**: admin123

To create admin, call: `POST /api/init-admin`

## Project Structure

```
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Auth context
│   │   └── data/         # Blog articles
│   ├── package.json
│   └── .env
├── Dockerfile            # Single container build
├── railway.json          # Railway configuration
└── README.md
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/` | GET | Health check |
| `/api/auth/login` | POST | Admin login |
| `/api/bookings` | GET/POST | List/create bookings |
| `/api/bookings/{id}` | PATCH/DELETE | Update/delete booking |
| `/api/queries` | GET/POST | List/create queries |
| `/api/chat` | POST | AI chat endpoint |
| `/api/time-slots/{date}` | GET | Available time slots |
| `/api/analytics/summary` | GET | Dashboard stats |

## License

Private - All rights reserved.
