from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password: str  # Will be hashed
    role: str = "user"  # "admin" or "user"
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "user"

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TestResult(BaseModel):
    status: str  # "IN" or "OUT"
    reason: Optional[str] = None
    otherReason: Optional[str] = None

class BallotData(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    panelistName: Optional[str] = "Unknown"
    productType: str
    otherProductType: Optional[str] = None
    productVariant: Optional[str] = None
    otherProductVariant: Optional[str] = None
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
    sessionCode: Optional[str] = None  # For collaborative sessions
    status: str = "in_progress"  # "in_progress" or "completed"
    targetPanelistCount: int = 1
    ballots: List[BallotData] = []
    createdBy: Optional[str] = None  # Username of creator
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completedAt: Optional[str] = None
    summary: Optional[Dict[str, Any]] = None
    verifiedBy: Optional[str] = None  # BSL username who verified
    verifiedByName: Optional[str] = None  # BSL full name
    verificationSignature: Optional[str] = None  # Base64 signature image
    verificationTimestamp: Optional[str] = None

class BatchSessionCreate(BaseModel):
    targetPanelistCount: int
    sessionCode: Optional[str] = None

class BallotSubmit(BaseModel):
    sessionCode: str
    ballotData: BallotData

class DailySummaryVerification(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    date: str  # Date of the summary (YYYY-MM-DD format)
    verifiedBy: str  # Username of BSL
    verifiedByName: str  # Full name of BSL
    signature: str  # Digital signature (base64 encoded image)
    verificationTimestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    sessionIds: List[str] = []  # List of session IDs included in this summary
    comments: Optional[str] = None

class VerificationCreate(BaseModel):
    date: str
    verifiedByName: str
    signature: str
    sessionIds: List[str]
    comments: Optional[str] = None

class SessionVerification(BaseModel):
    sessionCode: str
    verifiedByName: str
    signature: str  # Base64 encoded image

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return {"username": username, "role": role}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Initialize default admin user - ONLY if no users exist
async def init_admin():
    user_count = await db.users.count_documents({})
    if user_count == 0:
        admin_user = {
            "id": str(uuid.uuid4()),
            "username": "admin",
            "password": get_password_hash("admin123"),
            "role": "admin",
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        print("First admin user created: username=admin, password=admin123")

@app.on_event("startup")
async def startup_event():
    await init_admin()

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Global Acqua Pvt Ltd - Sensory Analysis API"}

# Authentication routes
@api_router.post("/auth/login", response_model=Token)
async def login(user_login: UserLogin):
    user = await db.users.find_one({"username": user_login.username})
    if not user or not verify_password(user_login.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user["role"],
        "username": user["username"]
    }

# Admin routes - User management
@api_router.post("/admin/users", dependencies=[Depends(get_admin_user)])
async def create_user(user: UserCreate):
    # Check if username already exists
    existing_user = await db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = {
        "id": str(uuid.uuid4()),
        "username": user.username,
        "password": get_password_hash(user.password),
        "role": user.role,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(new_user)
    return {"message": "User created successfully", "username": user.username}

@api_router.get("/admin/users", dependencies=[Depends(get_admin_user)])
async def get_users():
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.delete("/admin/users/{username}", dependencies=[Depends(get_admin_user)])
async def delete_user(username: str, current_user: dict = Depends(get_admin_user)):
    # Prevent deleting yourself
    if username == current_user["username"]:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Prevent deleting the default admin account
    if username == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete the default admin account")
    
    # Check if this is the last admin
    user_to_delete = await db.users.find_one({"username": username})
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_to_delete["role"] == "admin":
        admin_count = await db.users.count_documents({"role": "admin"})
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the last admin user")
    
    result = await db.users.delete_one({"username": username})
    return {"message": "User deleted successfully"}

# Session routes
@api_router.post("/sessions/create", dependencies=[Depends(get_current_user)])
async def create_session(input: BatchSessionCreate, current_user: dict = Depends(get_current_user)):
    # Generate unique session code
    session_code = input.sessionCode or str(uuid.uuid4())[:8].upper()
    
    session = BatchSession(
        sessionCode=session_code,
        status="in_progress",
        targetPanelistCount=input.targetPanelistCount,
        ballots=[],
        createdBy=current_user["username"]
    )
    
    doc = session.model_dump()
    await db.sessions.insert_one(doc)
    return session

@api_router.post("/sessions/submit-ballot")
async def submit_ballot(input: BallotSubmit):
    # Find session by code
    session = await db.sessions.find_one({"sessionCode": input.sessionCode})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Add ballot to session
    ballots = session.get("ballots", [])
    ballots.append(input.ballotData.model_dump())
    
    # Check if session is complete
    status = "completed" if len(ballots) >= session["targetPanelistCount"] else "in_progress"
    completed_at = datetime.now(timezone.utc).isoformat() if status == "completed" else None
    
    # Update session
    await db.sessions.update_one(
        {"sessionCode": input.sessionCode},
        {
            "$set": {
                "ballots": ballots,
                "status": status,
                "completedAt": completed_at
            }
        }
    )
    
    # Fetch updated session
    updated_session = await db.sessions.find_one({"sessionCode": input.sessionCode}, {"_id": 0})
    return updated_session

@api_router.get("/sessions/code/{session_code}")
async def get_session_by_code(session_code: str):
    session = await db.sessions.find_one({"sessionCode": session_code}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@api_router.get("/sessions", response_model=List[BatchSession])
async def get_sessions(current_user: dict = Depends(get_current_user)):
    # Admin can see all sessions, users can only see their own
    query = {} if current_user["role"] == "admin" else {"createdBy": current_user["username"]}
    sessions = await db.sessions.find(query, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return sessions

@api_router.get("/admin/sessions/all", dependencies=[Depends(get_admin_user)])
async def get_all_sessions():
    sessions = await db.sessions.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return sessions

@api_router.get("/sessions/{session_id}", response_model=BatchSession)
async def get_session(session_id: str, current_user: dict = Depends(get_current_user)):
    session = await db.sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check access
    if current_user["role"] != "admin" and session.get("createdBy") != current_user["username"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return session

@api_router.delete("/admin/sessions/{session_code}", dependencies=[Depends(get_admin_user)])
async def delete_session(session_code: str):
    session = await db.sessions.find_one({"sessionCode": session_code})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    result = await db.sessions.delete_one({"sessionCode": session_code})
    return {"message": "Session deleted successfully", "sessionCode": session_code}

@api_router.delete("/admin/sessions", dependencies=[Depends(get_admin_user)])
async def clear_sessions():
    result = await db.sessions.delete_many({})
    return {"deleted_count": result.deleted_count, "message": "All sessions cleared"}

# Daily Summary and BSL Verification endpoints
@api_router.get("/admin/daily-summary/{date}", dependencies=[Depends(get_admin_user)])
async def get_daily_summary(date: str):
    """Get all completed sessions for a specific date"""
    try:
        # Get all completed sessions
        all_sessions = await db.sessions.find({"status": "completed"}, {"_id": 0}).to_list(1000)
        
        # Filter by date (check if completedAt or createdAt matches the target date)
        filtered_sessions = []
        for session in all_sessions:
            # Check completedAt first
            session_date = None
            if session.get("completedAt"):
                try:
                    session_date = session["completedAt"].split("T")[0]
                except:
                    pass
            
            # Fallback to createdAt if completedAt doesn't match
            if not session_date or session_date != date:
                if session.get("createdAt"):
                    try:
                        session_date = session["createdAt"].split("T")[0]
                    except:
                        pass
            
            # If either matches, include the session
            if session_date == date:
                filtered_sessions.append(session)
        
        # Check if there's already a verification for this date
        verification = await db.verifications.find_one({"date": date}, {"_id": 0})
        
        return {
            "date": date,
            "sessions": filtered_sessions,
            "verification": verification,
            "totalSessions": len(filtered_sessions)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching daily summary: {str(e)}")

@api_router.post("/admin/verify-summary", dependencies=[Depends(get_admin_user)])
async def verify_daily_summary(verification: VerificationCreate, current_user: dict = Depends(get_admin_user)):
    """BSL verifies the daily summary with digital signature"""
    # Check if already verified for this date
    existing = await db.verifications.find_one({"date": verification.date})
    if existing:
        raise HTTPException(status_code=400, detail="Summary already verified for this date")
    
    verification_doc = {
        "id": str(uuid.uuid4()),
        "date": verification.date,
        "verifiedBy": current_user["username"],
        "verifiedByName": verification.verifiedByName,
        "signature": verification.signature,
        "verificationTimestamp": datetime.now(timezone.utc).isoformat(),
        "sessionIds": verification.sessionIds,
        "comments": verification.comments
    }
    
    await db.verifications.insert_one(verification_doc)
    return {"message": "Summary verified successfully", "verification": verification_doc}

@api_router.get("/admin/verification/{date}", dependencies=[Depends(get_admin_user)])
async def get_verification(date: str):
    """Get verification status for a specific date"""
    verification = await db.verifications.find_one({"date": date}, {"_id": 0})
    if not verification:
        raise HTTPException(status_code=404, detail="No verification found for this date")
    return verification

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