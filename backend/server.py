from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret')
JWT_ALGORITHM = "HS256"

# OpenRouter API Key
OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY', '')
OPENROUTER_MODEL = os.environ.get('OPENROUTER_MODEL', 'meta-llama/llama-3.1-8b-instruct:free')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# ============== MODELS ==============

class BookingCreate(BaseModel):
    name: str
    email: str
    phone: str
    service: str
    date: str
    time_slot: str
    notes: Optional[str] = ""

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    service: str
    date: str
    time_slot: str
    notes: Optional[str] = ""
    admin_notes: Optional[str] = ""
    status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class QueryCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = ""
    subject: str
    message: str

class Query(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = ""
    subject: str
    message: str
    admin_notes: Optional[str] = ""
    status: str = "new"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AdminLogin(BaseModel):
    username: str
    password: str

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class BookingStatusUpdate(BaseModel):
    status: str

class BookingNotesUpdate(BaseModel):
    admin_notes: str

class QueryStatusUpdate(BaseModel):
    status: str

class QueryNotesUpdate(BaseModel):
    admin_notes: str

# ============== HELPERS ==============

def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Business system message for AI
SYSTEM_MESSAGE = """You are a friendly AI assistant for "Best Astrologer in Dandenong" - a professional psychic and astrology service in Victoria, Australia.

Business Information:
- Services: Psychic Reading, Astrology Consultation, Spiritual Reading, Love Reading, Get Your Love Back guidance
- Location: 16 Grant St, Dandenong VIC 3175, Australia
- Phone: +61 426 272 559
- Hours: Open 24 hours, 7 days a week
- Rating: 5 stars with 248+ reviews
- Wheelchair accessible

You can help with:
- Explaining our services and what to expect
- Answering general questions about psychic readings, astrology, and spiritual guidance
- Providing information about booking appointments
- Sharing our location and contact details

Be warm, mystical yet professional. If customers have complex questions about their specific situation or want to book an appointment, encourage them to use our booking system or contact form.

Keep responses concise but helpful. Never claim to actually perform readings - direct them to book an appointment for personalized services."""

# ============== AUTH ROUTES ==============

@api_router.post("/auth/login")
async def admin_login(data: AdminLogin):
    admin = await db.admins.find_one({"username": data.username}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(data.password.encode(), admin["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(data.username)
    return {"token": token, "username": data.username}

@api_router.get("/auth/me")
async def get_current_admin(username: str = Depends(verify_token)):
    return {"username": username}

# ============== BOOKING ROUTES ==============

@api_router.post("/bookings", response_model=Booking)
async def create_booking(data: BookingCreate):
    booking = Booking(**data.model_dump())
    doc = booking.model_dump()
    await db.bookings.insert_one(doc)
    
    # Track analytics
    await db.analytics.update_one(
        {"type": "bookings", "date": datetime.now(timezone.utc).strftime("%Y-%m-%d")},
        {"$inc": {"count": 1}},
        upsert=True
    )
    
    return booking

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(username: str = Depends(verify_token)):
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return bookings

@api_router.patch("/bookings/{booking_id}")
async def update_booking_status(booking_id: str, data: BookingStatusUpdate, username: str = Depends(verify_token)):
    result = await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"status": data.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking updated"}

@api_router.patch("/bookings/{booking_id}/notes")
async def update_booking_notes(booking_id: str, data: BookingNotesUpdate, username: str = Depends(verify_token)):
    result = await db.bookings.update_one(
        {"id": booking_id},
        {"$set": {"admin_notes": data.admin_notes}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Notes updated"}

@api_router.delete("/bookings/{booking_id}")
async def delete_booking(booking_id: str, username: str = Depends(verify_token)):
    result = await db.bookings.delete_one({"id": booking_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking deleted"}

# ============== QUERY ROUTES ==============

@api_router.post("/queries", response_model=Query)
async def create_query(data: QueryCreate):
    query = Query(**data.model_dump())
    doc = query.model_dump()
    await db.queries.insert_one(doc)
    
    # Track analytics
    await db.analytics.update_one(
        {"type": "queries", "date": datetime.now(timezone.utc).strftime("%Y-%m-%d")},
        {"$inc": {"count": 1}},
        upsert=True
    )
    
    return query

@api_router.get("/queries", response_model=List[Query])
async def get_queries(username: str = Depends(verify_token)):
    queries = await db.queries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return queries

@api_router.patch("/queries/{query_id}")
async def update_query_status(query_id: str, data: QueryStatusUpdate, username: str = Depends(verify_token)):
    result = await db.queries.update_one(
        {"id": query_id},
        {"$set": {"status": data.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Query not found")
    return {"message": "Query updated"}

@api_router.patch("/queries/{query_id}/notes")
async def update_query_notes(query_id: str, data: QueryNotesUpdate, username: str = Depends(verify_token)):
    result = await db.queries.update_one(
        {"id": query_id},
        {"$set": {"admin_notes": data.admin_notes}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Query not found")
    return {"message": "Notes updated"}

@api_router.delete("/queries/{query_id}")
async def delete_query(query_id: str, username: str = Depends(verify_token)):
    result = await db.queries.delete_one({"id": query_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Query not found")
    return {"message": "Query deleted"}

# ============== CHAT ROUTES ==============

@api_router.post("/chat")
async def chat_with_ai(data: ChatMessage):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=503, detail="AI chat is not configured. Please set OPENROUTER_API_KEY.")
    
    session_id = data.session_id or str(uuid.uuid4())
    
    try:
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }
        referer = os.environ.get('HTTP_REFERER', '')
        site_title = os.environ.get('SITE_TITLE', '')
        if referer:
            headers["HTTP-Referer"] = referer
        if site_title:
            headers["X-Title"] = site_title

        payload = {
            "model": OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": SYSTEM_MESSAGE},
                {"role": "user", "content": data.message},
            ],
        }
        
        resp = requests.post(
            "https://api.openrouter.ai/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30,
        )
        if not resp.ok:
            logging.error(
                f"OpenRouter error: status={resp.status_code} body={resp.text[:500]}"
            )
            raise HTTPException(
                status_code=502,
                detail="AI service returned an error. Please try again later or contact us directly.",
            )
        result = resp.json()
        response_text = result["choices"][0]["message"]["content"]
        
        # Track chat analytics
        await db.analytics.update_one(
            {"type": "chats", "date": datetime.now(timezone.utc).strftime("%Y-%m-%d")},
            {"$inc": {"count": 1}},
            upsert=True
        )
        
        return {"response": response_text, "session_id": session_id}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(
            status_code=502,
            detail="I'm having trouble connecting right now. Please try our contact form or call us at +61 426 272 559.",
        )

# ============== ANALYTICS ROUTES ==============

@api_router.get("/analytics/summary")
async def get_analytics_summary(username: str = Depends(verify_token)):
    # Get total counts
    total_bookings = await db.bookings.count_documents({})
    pending_bookings = await db.bookings.count_documents({"status": "pending"})
    confirmed_bookings = await db.bookings.count_documents({"status": "confirmed"})
    
    total_queries = await db.queries.count_documents({})
    new_queries = await db.queries.count_documents({"status": "new"})
    
    # Get last 7 days analytics
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%d")
    
    booking_trends = await db.analytics.find(
        {"type": "bookings", "date": {"$gte": seven_days_ago}},
        {"_id": 0}
    ).to_list(7)
    
    query_trends = await db.analytics.find(
        {"type": "queries", "date": {"$gte": seven_days_ago}},
        {"_id": 0}
    ).to_list(7)
    
    chat_trends = await db.analytics.find(
        {"type": "chats", "date": {"$gte": seven_days_ago}},
        {"_id": 0}
    ).to_list(7)
    
    return {
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "confirmed_bookings": confirmed_bookings,
        "total_queries": total_queries,
        "new_queries": new_queries,
        "booking_trends": booking_trends,
        "query_trends": query_trends,
        "chat_trends": chat_trends
    }

@api_router.get("/analytics/page-views")
async def track_page_view(page: str):
    try:
        await db.analytics.update_one(
            {"type": "page_views", "page": page, "date": datetime.now(timezone.utc).strftime("%Y-%m-%d")},
            {"$inc": {"count": 1}},
            upsert=True
        )
        return {"message": "Tracked"}
    except Exception as e:
        logging.error(f"Analytics page-view tracking error: {str(e)}")
        raise HTTPException(status_code=503, detail="Analytics service unavailable")

# ============== TIME SLOTS ==============

@api_router.get("/time-slots/{date}")
async def get_available_time_slots(date: str):
    # Define all possible time slots (24 hour availability)
    all_slots = [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
        "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
    ]
    
    # Get booked slots for this date
    booked = await db.bookings.find(
        {"date": date, "status": {"$ne": "cancelled"}},
        {"time_slot": 1, "_id": 0}
    ).to_list(100)
    
    booked_slots = [b["time_slot"] for b in booked]
    available = [slot for slot in all_slots if slot not in booked_slots]
    
    return {"date": date, "available_slots": available, "booked_slots": booked_slots}

# ============== INIT ADMIN ==============

@api_router.post("/init-admin")
async def init_admin():
    existing = await db.admins.find_one({"username": "admin"})
    if existing:
        return {"message": "Admin already exists"}
    
    hashed = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
    await db.admins.insert_one({
        "id": str(uuid.uuid4()),
        "username": "admin",
        "password": hashed
    })
    return {"message": "Admin created", "username": "admin", "password": "admin123"}

# ============== ROOT ==============

@api_router.get("/")
async def root():
    return {"message": "Best Astrologer in Dandenong API"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# ── Serve the React frontend build (present only in Docker / production) ─────
FRONTEND_BUILD = ROOT_DIR.parent / "frontend" / "build"

if FRONTEND_BUILD.exists():
    # Serve compiled JS/CSS/media assets
    app.mount(
        "/static",
        StaticFiles(directory=str(FRONTEND_BUILD / "static")),
        name="react-static",
    )

    # Serve other root-level build artefacts (favicon, manifest, etc.)
    @app.get("/favicon.ico", include_in_schema=False)
    async def favicon():
        path = FRONTEND_BUILD / "favicon.ico"
        if not path.exists():
            raise HTTPException(status_code=404, detail="favicon.ico not found")
        return FileResponse(str(path))

    @app.get("/manifest.json", include_in_schema=False)
    async def manifest():
        path = FRONTEND_BUILD / "manifest.json"
        if not path.exists():
            raise HTTPException(status_code=404, detail="manifest.json not found")
        return FileResponse(str(path))

    # SPA catch-all – registered last so all /api/* routes take priority
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_react_app(full_path: str):
        return FileResponse(str(FRONTEND_BUILD / "index.html"))

