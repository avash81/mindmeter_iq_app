from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import random
import io
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# MongoDB Connection
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "mindmeter_iq")

if not MONGO_URL:
    raise Exception("❌ MONGO_URL missing in .env")

try:
    client = AsyncIOMotorClient(MONGO_URL, uuidRepresentation="standard", serverSelectionTimeoutMS=5000)
    db = client[DB_NAME]
    logging.info("✅ Connected to MongoDB")
except Exception as e:
    logging.error(f"❌ MongoDB Error: {e}")
    raise HTTPException(status_code=500, detail="Database connection failed")

# FastAPI App Setup
app = FastAPI()
api_router = APIRouter(prefix="/api")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MODELS
class TestConfig(BaseModel):
    age: int
    test_type: str = "standard"  # standard, quick, comprehensive

class TestResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    test_id: str
    correct_answers: int
    total_questions: int
    iq_score: int
    age: int
    time_taken: int  # in seconds
    percentile: float
    category_scores: dict
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TestResultCreate(BaseModel):
    test_id: str
    answers: List[int]
    time_taken: int
    age: int

class CertificateRequest(BaseModel):
    test_id: str
    name: str
    email: Optional[str] = None

# COMPREHENSIVE QUESTIONS BANK (50+ questions)
QUESTIONS_BANK = [
    # VISUAL PATTERN - Easy (10 questions)
    {"question_text": "Complete the pattern: 2, 4, 6, 8, ?", "options": ["9", "10", "11", "12"], "correct_answer": 1, "category": "pattern", "difficulty": "easy", "weight": 1},
    {"question_text": "What comes next: A, C, E, G, ?", "options": ["H", "I", "J", "K"], "correct_answer": 1, "category": "pattern", "difficulty": "easy", "weight": 1},
    {"question_text": "Find the missing number: 5, 10, 15, ?, 25", "options": ["18", "20", "22", "24"], "correct_answer": 1, "category": "pattern", "difficulty": "easy", "weight": 1},
    {"question_text": "Complete: 1, 1, 2, 3, 5, ?", "options": ["6", "7", "8", "9"], "correct_answer": 2, "category": "pattern", "difficulty": "easy", "weight": 1},
    {"question_text": "What's next: 10, 20, 30, 40, ?", "options": ["45", "50", "55", "60"], "correct_answer": 1, "category": "pattern", "difficulty": "easy", "weight": 1},
    {"question_text": "Pattern: 1, 4, 7, 10, ?", "options": ["11", "12", "13", "14"], "correct_answer": 2, "category": "pattern", "difficulty": "easy", "weight": 1},
    {"question_text": "Complete: 100, 95, 90, 85, ?", "options": ["75", "80", "82", "84"], "correct_answer": 1, "category": "pattern", "difficulty": "easy", "weight": 1},
    {"question_text": "Next in sequence: 3, 6, 9, 12, ?", "options": ["13", "14", "15", "16"], "correct_answer": 2, "category": "pattern", "difficulty": "easy", "weight": 1},
    {"question_text": "Pattern: 50, 45, 40, 35, ?", "options": ["25", "28", "30", "32"], "correct_answer": 2, "category": "pattern", "difficulty": "easy", "weight": 1},
    {"question_text": "What comes next: 7, 14, 21, 28, ?", "options": ["32", "34", "35", "36"], "correct_answer": 2, "category": "pattern", "difficulty": "easy", "weight": 1},
    
    # LOGICAL REASONING - Medium (15 questions)
    {"question_text": "If all roses are flowers and some flowers fade quickly, then:", "options": ["All roses fade quickly", "Some roses may fade quickly", "No roses fade quickly", "All flowers are roses"], "correct_answer": 1, "category": "logical", "difficulty": "medium", "weight": 2},
    {"question_text": "What comes next: 3, 6, 12, 24, ?", "options": ["36", "48", "60", "72"], "correct_answer": 1, "category": "logical", "difficulty": "medium", "weight": 2},
    {"question_text": "Complete: 1, 4, 9, 16, 25, ?", "options": ["30", "32", "36", "40"], "correct_answer": 2, "category": "logical", "difficulty": "medium", "weight": 2},
    {"question_text": "Pattern: 2, 5, 11, 23, ?", "options": ["35", "41", "47", "53"], "correct_answer": 2, "category": "logical", "difficulty": "medium", "weight": 2},
    {"question_text": "Next: 100, 92, 84, 76, ?", "options": ["70", "68", "66", "64"], "correct_answer": 1, "category": "logical", "difficulty": "medium", "weight": 2},
    {"question_text": "If A > B and B > C, then:", "options": ["A = C", "A < C", "A > C", "Cannot determine"], "correct_answer": 2, "category": "logical", "difficulty": "medium", "weight": 2},
    {"question_text": "Pattern: 5, 10, 20, 40, ?", "options": ["60", "70", "80", "90"], "correct_answer": 2, "category": "logical", "difficulty": "medium", "weight": 2},
    {"question_text": "If John is taller than Mike, and Mike is taller than Sam, who is shortest?", "options": ["John", "Mike", "Sam", "Equal height"], "correct_answer": 2, "category": "logical", "difficulty": "medium", "weight": 2},
    {"question_text": "Complete: 64, 32, 16, 8, ?", "options": ["2", "4", "6", "8"], "correct_answer": 1, "category": "logical", "difficulty": "medium", "weight": 2},
    {"question_text": "Pattern: 1, 3, 6, 10, 15, ?", "options": ["18", "19", "20", "21"], "correct_answer": 3, "category": "logical", "difficulty": "medium", "weight": 2},
    {"question_text": "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?", "options": ["5 minutes", "20 minutes", "100 minutes", "500 minutes"], "correct_answer": 0, "category": "logical", "difficulty": "medium", "weight": 2},
    {"question_text": "Pattern: 2, 6, 12, 20, 30, ?", "options": ["40", "42", "44", "46"], "correct_answer": 1, "category": "logical", "difficulty": "medium", "weight": 2},
    {"question_text": "Complete: 81, 27, 9, 3, ?", "options": ["0", "1", "2", "3"], "correct_answer": 1, "category": "logical", "difficulty": "medium", "weight": 2},
    {"question_text": "If all squares are rectangles but not all rectangles are squares, then:", "options": ["All rectangles are squares", "Some rectangles are not squares", "No rectangles are squares", "All shapes are squares"], "correct_answer": 1, "category": "logical", "difficulty": "medium", "weight": 2},
    {"question_text": "Pattern: 7, 10, 14, 19, 25, ?", "options": ["30", "31", "32", "33"], "correct_answer": 2, "category": "logical", "difficulty": "medium", "weight": 2},
    
    # MATHEMATICAL - Medium (10 questions)
    {"question_text": "If x + 5 = 12, what is x?", "options": ["5", "6", "7", "8"], "correct_answer": 2, "category": "math", "difficulty": "medium", "weight": 2},
    {"question_text": "What is 15% of 200?", "options": ["25", "30", "35", "40"], "correct_answer": 1, "category": "math", "difficulty": "medium", "weight": 2},
    {"question_text": "If a = 3 and b = 4, what is a² + b²?", "options": ["24", "25", "26", "27"], "correct_answer": 1, "category": "math", "difficulty": "medium", "weight": 2},
    {"question_text": "What is the average of 10, 20, 30?", "options": ["15", "18", "20", "25"], "correct_answer": 2, "category": "math", "difficulty": "medium", "weight": 2},
    {"question_text": "Solve: 3x - 7 = 14", "options": ["5", "6", "7", "8"], "correct_answer": 2, "category": "math", "difficulty": "medium", "weight": 2},
    {"question_text": "What is 25% of 80?", "options": ["15", "18", "20", "22"], "correct_answer": 2, "category": "math", "difficulty": "medium", "weight": 2},
    {"question_text": "If 2x = 18, what is x?", "options": ["6", "7", "8", "9"], "correct_answer": 3, "category": "math", "difficulty": "medium", "weight": 2},
    {"question_text": "What is 10% of 150?", "options": ["10", "15", "20", "25"], "correct_answer": 1, "category": "math", "difficulty": "medium", "weight": 2},
    {"question_text": "Solve: 5 + 3 × 2", "options": ["10", "11", "13", "16"], "correct_answer": 1, "category": "math", "difficulty": "medium", "weight": 2},
    {"question_text": "What is 30% of 90?", "options": ["24", "27", "30", "33"], "correct_answer": 1, "category": "math", "difficulty": "medium", "weight": 2},
    
    # VERBAL REASONING - Medium (10 questions)
    {"question_text": "Which word is most similar to 'rapid'?", "options": ["slow", "quick", "steady", "careful"], "correct_answer": 1, "category": "verbal", "difficulty": "medium", "weight": 2},
    {"question_text": "Book is to library as painting is to:", "options": ["museum", "studio", "canvas", "frame"], "correct_answer": 0, "category": "verbal", "difficulty": "medium", "weight": 2},
    {"question_text": "What relates clock, watch, and timer?", "options": ["time", "numbers", "hands", "tick"], "correct_answer": 0, "category": "verbal", "difficulty": "medium", "weight": 2},
    {"question_text": "Ocean is to water as desert is to:", "options": ["heat", "sand", "dry", "cactus"], "correct_answer": 1, "category": "verbal", "difficulty": "medium", "weight": 2},
    {"question_text": "Opposite of 'abundant':", "options": ["plentiful", "scarce", "many", "rich"], "correct_answer": 1, "category": "verbal", "difficulty": "medium", "weight": 2},
    {"question_text": "Pen is to writer as brush is to:", "options": ["paint", "artist", "canvas", "color"], "correct_answer": 1, "category": "verbal", "difficulty": "medium", "weight": 2},
    {"question_text": "Happy is to joyful as angry is to:", "options": ["sad", "furious", "calm", "peaceful"], "correct_answer": 1, "category": "verbal", "difficulty": "medium", "weight": 2},
    {"question_text": "Dog is to bark as cat is to:", "options": ["purr", "meow", "hiss", "growl"], "correct_answer": 1, "category": "verbal", "difficulty": "medium", "weight": 2},
    {"question_text": "Day is to night as hot is to:", "options": ["warm", "cool", "cold", "freezing"], "correct_answer": 2, "category": "verbal", "difficulty": "medium", "weight": 2},
    {"question_text": "Begin is to start as finish is to:", "options": ["complete", "end", "stop", "all of these"], "correct_answer": 3, "category": "verbal", "difficulty": "medium", "weight": 2},
    
    # ADVANCED PATTERNS - Hard (10 questions)
    {"question_text": "Complete: 2, 6, 12, 20, 30, ?", "options": ["40", "42", "44", "46"], "correct_answer": 1, "category": "pattern", "difficulty": "hard", "weight": 3},
    {"question_text": "Next: 1, 8, 27, 64, ?", "options": ["100", "125", "150", "175"], "correct_answer": 1, "category": "pattern", "difficulty": "hard", "weight": 3},
    {"question_text": "Pattern: 2, 3, 5, 7, 11, 13, ?", "options": ["15", "16", "17", "18"], "correct_answer": 2, "category": "pattern", "difficulty": "hard", "weight": 3},
    {"question_text": "Complete: 1, 3, 7, 15, 31, ?", "options": ["55", "61", "63", "67"], "correct_answer": 2, "category": "pattern", "difficulty": "hard", "weight": 3},
    {"question_text": "Pattern: 144, 121, 100, 81, ?", "options": ["60", "64", "70", "72"], "correct_answer": 1, "category": "pattern", "difficulty": "hard", "weight": 3},
    {"question_text": "Next: 2, 6, 14, 30, 62, ?", "options": ["120", "124", "126", "130"], "correct_answer": 2, "category": "pattern", "difficulty": "hard", "weight": 3},
    {"question_text": "Complete: 1, 1, 2, 6, 24, ?", "options": ["48", "72", "96", "120"], "correct_answer": 3, "category": "pattern", "difficulty": "hard", "weight": 3},
    {"question_text": "Pattern: 3, 7, 15, 31, 63, ?", "options": ["125", "127", "129", "131"], "correct_answer": 1, "category": "pattern", "difficulty": "hard", "weight": 3},
    {"question_text": "Next: 5, 10, 17, 26, 37, ?", "options": ["48", "50", "52", "54"], "correct_answer": 1, "category": "pattern", "difficulty": "hard", "weight": 3},
    {"question_text": "Complete: 1, 4, 10, 22, 46, ?", "options": ["92", "94", "96", "98"], "correct_answer": 1, "category": "pattern", "difficulty": "hard", "weight": 3},
]

def calculate_age_adjusted_iq(raw_score: float, age: int) -> int:
    """Calculate age-adjusted IQ score based on raw performance and age."""
    # Age adjustment factors (peak cognitive performance around 25-30)
    age_factors = {
        range(10, 15): 0.85,
        range(15, 20): 0.92,
        range(20, 30): 1.0,
        range(30, 40): 0.98,
        range(40, 50): 0.95,
        range(50, 60): 0.92,
        range(60, 100): 0.88
    }
    
    age_factor = 1.0
    for age_range, factor in age_factors.items():
        if age in age_range:
            age_factor = factor
            break
    
    # Base IQ calculation: 100 + (raw_score - 50) * 0.6, adjusted by age
    base_iq = 100 + (raw_score - 50) * 0.6
    adjusted_iq = int(base_iq / age_factor)
    
    # Clamp between 70 and 160
    return max(70, min(160, adjusted_iq))

def calculate_percentile(iq_score: int) -> float:
    """Calculate percentile ranking based on IQ score (assuming normal distribution)."""
    # Simplified percentile calculation
    if iq_score >= 145: return 99.9
    elif iq_score >= 130: return 98.0
    elif iq_score >= 120: return 91.0
    elif iq_score >= 110: return 75.0
    elif iq_score >= 100: return 50.0
    elif iq_score >= 90: return 25.0
    elif iq_score >= 80: return 9.0
    else: return 2.0

# ROUTES
@api_router.get("/")
async def root():
    return {"message": "MindMeter IQ API - Professional Edition"}

@api_router.get("/stats")
async def get_stats():
    """Get overall test statistics"""
    total_tests = await db.test_results.count_documents({})
    avg_iq = 100  # Default
    
    if total_tests > 0:
        pipeline = [{"$group": {"_id": None, "avg_iq": {"$avg": "$iq_score"}}}]
        result = await db.test_results.aggregate(pipeline).to_list(1)
        if result:
            avg_iq = int(result[0]["avg_iq"])
    
    return {
        "total_tests_taken": total_tests,
        "average_iq": avg_iq,
        "global_average": 100
    }

@api_router.post("/test/start")
async def start_test(config: TestConfig):
    # Determine number of questions based on test type
    num_questions = {
        "quick": 20,
        "standard": 30,
        "comprehensive": 50
    }.get(config.test_type, 30)
    
    # Shuffle and select questions
    shuffled_questions = random.sample(QUESTIONS_BANK, min(num_questions, len(QUESTIONS_BANK)))
    
    test_id = str(uuid.uuid4())
    
    # Prepare questions for frontend (without correct answers)
    questions_for_frontend = [
        {
            "id": str(i),
            "question_text": q["question_text"],
            "options": q["options"],
            "category": q["category"]
        }
        for i, q in enumerate(shuffled_questions)
    ]
    
    # Store session with full question data
    await db.test_sessions.insert_one({
        "test_id": test_id,
        "questions": shuffled_questions,
        "config": {"age": config.age, "test_type": config.test_type},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {
        "test_id": test_id,
        "questions": questions_for_frontend,
        "total_questions": len(shuffled_questions),
        "time_limit": len(shuffled_questions) * 60  # 60 seconds per question
    }

@api_router.post("/test/submit", response_model=TestResult)
async def submit_test(result: TestResultCreate):
    test_session = await db.test_sessions.find_one({"test_id": result.test_id})
    if not test_session:
        raise HTTPException(status_code=404, detail="Test session not found")
    
    questions = test_session["questions"]
    correct_count = 0
    category_correct = {"pattern": 0, "logical": 0, "math": 0, "verbal": 0}
    category_total = {"pattern": 0, "logical": 0, "math": 0, "verbal": 0}
    weighted_score = 0
    total_weight = 0
    
    for i, answer in enumerate(result.answers):
        if i < len(questions):
            q = questions[i]
            category = q["category"]
            weight = q.get("weight", 1)
            
            category_total[category] = category_total.get(category, 0) + 1
            total_weight += weight
            
            if answer == q["correct_answer"]:
                correct_count += 1
                category_correct[category] = category_correct.get(category, 0) + 1
                weighted_score += weight
    
    # Calculate raw percentage
    total_questions = len(questions)
    percentage = (weighted_score / total_weight * 100) if total_weight > 0 else 0
    
    # Calculate age-adjusted IQ
    iq_score = calculate_age_adjusted_iq(percentage, result.age)
    percentile = calculate_percentile(iq_score)
    
    # Calculate category scores
    category_scores = {}
    for cat in category_correct:
        if category_total[cat] > 0:
            cat_percentage = (category_correct[cat] / category_total[cat]) * 100
            category_scores[cat] = round(cat_percentage, 1)
    
    test_result = TestResult(
        test_id=result.test_id,
        correct_answers=correct_count,
        total_questions=total_questions,
        iq_score=iq_score,
        age=result.age,
        time_taken=result.time_taken,
        percentile=percentile,
        category_scores=category_scores
    )
    
    result_doc = test_result.model_dump()
    result_doc["timestamp"] = result_doc["timestamp"].isoformat()
    await db.test_results.insert_one(result_doc)
    
    return test_result

@api_router.post("/certificate/download")
async def download_certificate(cert_request: CertificateRequest):
    test_result = await db.test_results.find_one({"test_id": cert_request.test_id})
    if not test_result:
        raise HTTPException(status_code=404, detail="Test result not found")
    
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Professional certificate design
    # Border
    c.setStrokeColor(colors.HexColor("#1e3a8a"))
    c.setLineWidth(4)
    c.rect(30, 30, width - 60, height - 60)
    
    c.setStrokeColor(colors.HexColor("#7c3aed"))
    c.setLineWidth(2)
    c.rect(40, 40, width - 80, height - 80)
    
    # Title
    c.setFont("Helvetica-Bold", 40)
    c.setFillColor(colors.HexColor("#1e3a8a"))
    c.drawCentredString(width / 2, height - 100, "IQ TEST CERTIFICATE")
    
    # Subtitle
    c.setFont("Helvetica", 18)
    c.setFillColor(colors.HexColor("#374151"))
    c.drawCentredString(width / 2, height - 140, "MindMeter Professional IQ Assessment")
    
    # Name section
    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2, height - 200, "This certifies that")
    
    c.setFont("Helvetica-Bold", 32)
    c.setFillColor(colors.HexColor("#1e3a8a"))
    c.drawCentredString(width / 2, height - 240, cert_request.name)
    
    # Score section
    c.setFont("Helvetica", 14)
    c.setFillColor(colors.HexColor("#374151"))
    c.drawCentredString(width / 2, height - 300, "has completed the MindMeter IQ Test with a score of")
    
    c.setFont("Helvetica-Bold", 60)
    c.setFillColor(colors.HexColor("#7c3aed"))
    c.drawCentredString(width / 2, height - 380, str(test_result["iq_score"]))
    
    # Percentile
    c.setFont("Helvetica", 14)
    c.setFillColor(colors.HexColor("#374151"))
    percentile_text = f"Percentile: {test_result.get('percentile', 50)}th"
    c.drawCentredString(width / 2, height - 420, percentile_text)
    
    # Date
    c.setFont("Helvetica", 12)
    date_str = datetime.now(timezone.utc).strftime("%B %d, %Y")
    c.drawCentredString(width / 2, height - 480, f"Date: {date_str}")
    
    # Footer
    c.setFont("Helvetica", 10)
    c.drawCentredString(width / 2, 80, "This certificate is issued for demonstration purposes only")
    c.drawCentredString(width / 2, 60, "MindMeter - Professional IQ Testing Platform")
    
    c.save()
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=IQ_Certificate_{cert_request.name.replace(' ', '_')}.pdf"
        }
    )

# Include router
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()