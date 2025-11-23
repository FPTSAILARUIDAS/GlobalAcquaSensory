from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class TestResult(BaseModel):
    status: str  # "IN" or "OUT"
    reason: Optional[str] = None
    otherReason: Optional[str] = None

class BallotData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    panelistName: Optional[str] = "Unknown"
    productType: str
    productVariant: Optional[str] = None
    productCode: str
    dateOfMfg: str
    controlSampleCode: str
    productTime: str
    testingCompletionDate: Optional[str] = None
    testingCompletionTime: Optional[str] = None
    appearance: TestResult
    odour: TestResult
    taste: TestResult
    remarks: Optional[str] = None

class BatchSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "completed"
    ballots: List[BallotData]
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    summary: Optional[Dict[str, Any]] = None

class BatchSessionCreate(BaseModel):
    ballots: List[BallotData]
    summary: Optional[Dict[str, Any]] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Global Acqua Sensory Analysis API"}

@api_router.post("/sessions", response_model=BatchSession)
async def create_session(input: BatchSessionCreate):
    session = BatchSession(
        ballots=input.ballots,
        summary=input.summary
    )
    
    # Convert to dict for MongoDB
    doc = session.model_dump()
    
    _ = await db.sessions.insert_one(doc)
    return session

@api_router.get("/sessions", response_model=List[BatchSession])
async def get_sessions():
    # Exclude MongoDB's _id field from the query results
    sessions = await db.sessions.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return sessions

@api_router.get("/sessions/{session_id}", response_model=BatchSession)
async def get_session(session_id: str):
    session = await db.sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@api_router.delete("/sessions")
async def clear_sessions():
    result = await db.sessions.delete_many({})
    return {"deleted_count": result.deleted_count, "message": "All sessions cleared"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()