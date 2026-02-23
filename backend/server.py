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
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'astrologer_db')]

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret_change_in_production')
JWT_ALGORITHM = "HS256"

# Groq API Config
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
GROQ_MODEL = os.environ.get('GROQ_MODEL', 'llama-3.3-70b-versatile')

# Create the main app
app = FastAPI(title="Best Astrologer Dandenong API")
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

async def chat_with_groq(message: str, session_id: str) -> str:
    """Send message to Groq API and get response"""
    if not GROQ_API_KEY:
        return "I apologize, but I'm currently unavailable. Please use our booking system or contact us at +61 426 272 559."
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": SYSTEM_MESSAGE},
                        {"role": "user", "content": message}
                    ],
                    "temperature": 0.7,
                    "max_tokens": 500
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                logging.error(f"Groq API error: {response.status_code} - {response.text}")
                return "I apologize, but I'm having trouble connecting right now. Please try our contact form or call us at +61 426 272 559."
                
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        return "I apologize, but I'm experiencing some difficulties. Please try again or contact us at +61 426 272 559."

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
    session_id = data.session_id or str(uuid.uuid4())
    
    # Get AI response
    response = await chat_with_groq(data.message, session_id)
    
    # Track chat analytics
    await db.analytics.update_one(
        {"type": "chats", "date": datetime.now(timezone.utc).strftime("%Y-%m-%d")},
        {"$inc": {"count": 1}},
        upsert=True
    )
    
    return {"response": response, "session_id": session_id}

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
    await db.analytics.update_one(
        {"type": "page_views", "page": page, "date": datetime.now(timezone.utc).strftime("%Y-%m-%d")},
        {"$inc": {"count": 1}},
        upsert=True
    )
    return {"message": "Tracked"}

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

# ============== HEALTH CHECK ==============

@api_router.get("/")
async def root():
    return {"message": "Best Astrologer in Dandenong API", "status": "healthy"}

@api_router.get("/health")
async def health_check():
    try:
        # Check MongoDB connection
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": str(e)}

# Include router
app.include_router(api_router)

# CORS configuration
cors_origins = os.environ.get('CORS_ORIGINS', '*')
if cors_origins == '*':
    origins = ['*']
else:
    origins = [origin.strip() for origin in cors_origins.split(',')]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files in production (Railway)
static_path = ROOT_DIR / "static"
if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path / "static")), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # API routes are handled by the router
        if full_path.startswith("api"):
            raise HTTPException(status_code=404)
        
        # Check if file exists
        file_path = static_path / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        
        # Return index.html for SPA routing
        return FileResponse(static_path / "index.html")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
