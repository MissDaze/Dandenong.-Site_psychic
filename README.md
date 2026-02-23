# Best Astrologer Dandenong - Website

Professional website for psychic and astrology services with AI-powered chat, online booking, and admin dashboard.

## Features

- ✅ **Homepage** - Stunning mystical design with services and testimonials
- ✅ **Online Booking** - Calendar-based scheduling with no double-bookings
- ✅ **AI Chat** - 24/7 customer support powered by Groq (Llama 3.3)
- ✅ **Blog** - 4 SEO-optimized articles
- ✅ **Contact Form** - Capture customer enquiries
- ✅ **Admin Dashboard** - Manage bookings, queries, call/text/email clients

## Tech Stack

- **Frontend**: React, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI, Python
- **Database**: MongoDB Atlas
- **AI**: Groq (Llama 3.3 - free tier)

---

## 🚀 Deploy to Railway (Step-by-Step)

### Step 1: Set Up MongoDB Atlas (Free)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create a cluster:
   - Click "Build a Database"
   - Choose **M0 FREE** tier
   - Select region closest to you
   - Click "Create"
4. Create database user:
   - Go to "Database Access" in sidebar
   - Click "Add New Database User"
   - Choose username/password (save these!)
   - Click "Add User"
5. Allow network access:
   - Go to "Network Access" in sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (adds 0.0.0.0/0)
   - Click "Confirm"
6. Get connection string:
   - Go to "Database" in sidebar
   - Click "Connect" on your cluster
   - Choose "Drivers"
   - Copy the connection string
   - Replace `<password>` with your database user password

**Your MONGO_URL will look like:**
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/astrologer?retryWrites=true&w=majority
```

### Step 2: Get Groq API Key (Free)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free, no credit card required)
3. Go to "API Keys" in sidebar
4. Click "Create API Key"
5. Copy the key (starts with `gsk_`)

**Free tier includes ~500,000 tokens/day**

### Step 3: Push to GitHub

```bash
# In your project folder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/astrologer-website.git
git push -u origin main
```

### Step 4: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Railway will detect the Dockerfile automatically

### Step 5: Set Environment Variables

In Railway, go to your service → "Variables" tab → "Add Variable":

| Variable | Value |
|----------|-------|
| `MONGO_URL` | Your MongoDB Atlas connection string |
| `DB_NAME` | `astrologer_db` |
| `GROQ_API_KEY` | Your Groq API key (gsk_...) |
| `JWT_SECRET` | Generate: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `CORS_ORIGINS` | `*` (or your domain) |

### Step 6: Deploy!

Railway will automatically build and deploy. Your site will be live at:
```
https://your-project-name.up.railway.app
```

### Step 7: Initialize Admin

After deployment, visit:
```
https://your-project-name.up.railway.app/api/init-admin
```

Then login at `/admin` with:
- Username: `admin`
- Password: `admin123`

**⚠️ Change the admin password after first login!**

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas)

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Edit with your values
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | ✅ | MongoDB connection string |
| `DB_NAME` | ✅ | Database name (default: astrologer_db) |
| `GROQ_API_KEY` | ✅ | Groq API key for AI chat |
| `GROQ_MODEL` | ❌ | Model name (default: llama-3.3-70b-versatile) |
| `JWT_SECRET` | ✅ | Secret for auth tokens |
| `CORS_ORIGINS` | ❌ | Allowed origins (default: *) |
| `PORT` | ❌ | Server port (Railway sets this) |

---

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/` | GET | No | Health check |
| `/api/health` | GET | No | Detailed health check |
| `/api/auth/login` | POST | No | Admin login |
| `/api/init-admin` | POST | No | Create default admin |
| `/api/bookings` | GET | Yes | List all bookings |
| `/api/bookings` | POST | No | Create booking |
| `/api/bookings/{id}` | PATCH | Yes | Update booking status |
| `/api/bookings/{id}/notes` | PATCH | Yes | Update admin notes |
| `/api/bookings/{id}` | DELETE | Yes | Delete booking |
| `/api/queries` | GET | Yes | List all queries |
| `/api/queries` | POST | No | Submit query |
| `/api/queries/{id}` | PATCH | Yes | Update query status |
| `/api/queries/{id}/notes` | PATCH | Yes | Update admin notes |
| `/api/time-slots/{date}` | GET | No | Get available slots |
| `/api/chat` | POST | No | AI chat |
| `/api/analytics/summary` | GET | Yes | Dashboard stats |

---

## Troubleshooting

### AI Chat not working
- Check `GROQ_API_KEY` is set correctly
- Verify at [console.groq.com](https://console.groq.com) your key is active
- Check Railway logs for errors

### Database connection failed
- Verify `MONGO_URL` is correct
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Ensure database user password is correct

### Booking calendar not showing slots
- Check browser console for API errors
- Verify `/api/time-slots/{date}` returns data

---

## License

Private - All rights reserved.
