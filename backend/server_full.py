"from fastapi import FastAPI, APIRouter, HTTPException
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
load_dotenv(ROOT_DIR / \".env\")

# MongoDB Connection
MONGO_URL = os.getenv(\"MONGO_URL\")
DB_NAME = os.getenv(\"DB_NAME\", \"testiq_db\")

if not MONGO_URL:
    raise Exception(\"MONGO_URL missing in .env\")

try:
    client = AsyncIOMotorClient(
        MONGO_URL,
        uuidRepresentation=\"standard\",
        serverSelectionTimeoutMS=5000
    )
    db = client[DB_NAME]
    logging.info(\"Connected to MongoDB\")
except Exception as e:
    logging.error(f\"MongoDB Error: {e}\")
    raise HTTPException(status_code=500, detail=\"Database connection failed\")

# FastAPI App Setup
app = FastAPI(title=\"TestIQ API\", version=\"1.0.0\", description=\"Intelligence Testing Platform API\")
api_router = APIRouter(prefix=\"/api\")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[\"*\"],
    allow_credentials=False,
    allow_methods=[\"*\"],
    allow_headers=[\"*\"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MODELS
class Question(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question_text: str
    options: List[str]
    correct_answer: int
    category: str
    difficulty: str

class TestConfig(BaseModel):
    duration: str
    question_types: List[str]
    difficulty: str

class TestResult(BaseModel):
    model_config = ConfigDict(extra=\"ignore\")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    test_id: str
    correct_answers: int
    total_questions: int
    iq_score: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TestResultCreate(BaseModel):
    test_id: str
    answers: List[int]

class CertificateRequest(BaseModel):
    test_id: str
    name: str
    email: Optional[str] = None

# QUESTIONS BANK
QUESTIONS_BANK = [
    {
        \"question_text\": \"What number comes next in the sequence: 2, 4, 8, 16, ?\",
        \"options\": [\"24\", \"32\", \"20\", \"18\"],
        \"correct_answer\": 1,
        \"category\": \"math\",
        \"difficulty\": \"easy\"
    },
    {
        \"question_text\": \"If all roses are flowers and some flowers fade quickly, can we conclude that some roses fade quickly?\",
        \"options\": [\"Yes\", \"No\", \"Cannot be determined\", \"Only in summer\"],
        \"correct_answer\": 2,
        \"category\": \"verbal\",
        \"difficulty\": \"medium\"
    },
    {
        \"question_text\": \"Which number doesn't belong: 2, 3, 5, 7, 9, 11?\",
        \"options\": [\"2\", \"9\", \"7\", \"11\"],
        \"correct_answer\": 1,
        \"category\": \"pattern\",
        \"difficulty\": \"medium\"
    },
    {
        \"question_text\": \"What is 15% of 200?\",
        \"options\": [\"30\", \"25\", \"35\", \"20\"],
        \"correct_answer\": 0,
        \"category\": \"math\",
        \"difficulty\": \"easy\"
    },
    {
        \"question_text\": \"Book is to Reading as Fork is to ?\",
        \"options\": [\"Drawing\", \"Writing\", \"Eating\", \"Stirring\"],
        \"correct_answer\": 2,
        \"category\": \"verbal\",
        \"difficulty\": \"easy\"
    },
    {
        \"question_text\": \"Complete the pattern: 1, 1, 2, 3, 5, 8, ?\",
        \"options\": [\"11\", \"13\", \"12\", \"15\"],
        \"correct_answer\": 1,
        \"category\": \"pattern\",
        \"difficulty\": \"medium\"
    },
    {
        \"question_text\": \"If 5x + 3 = 18, what is x?\",
        \"options\": [\"3\", \"4\", \"5\", \"2\"],
        \"correct_answer\": 0,
        \"category\": \"math\",
        \"difficulty\": \"medium\"
    },
    {
        \"question_text\": \"What comes next: A, C, E, G, ?\",
        \"options\": [\"H\", \"I\", \"J\", \"K\"],
        \"correct_answer\": 1,
        \"category\": \"pattern\",
        \"difficulty\": \"easy\"
    },
    {
        \"question_text\": \"Which word is the odd one out: Dog, Cat, Lion, Table, Tiger?\",
        \"options\": [\"Dog\", \"Table\", \"Lion\", \"Tiger\"],
        \"correct_answer\": 1,
        \"category\": \"verbal\",
        \"difficulty\": \"easy\"
    },
    {
        \"question_text\": \"What is the square root of 144?\",
        \"options\": [\"11\", \"12\", \"13\", \"14\"],
        \"correct_answer\": 1,
        \"category\": \"math\",
        \"difficulty\": \"easy\"
    },
    {
        \"question_text\": \"Complete: 3, 6, 12, 24, ?\",
        \"options\": [\"36\", \"48\", \"42\", \"30\"],
        \"correct_answer\": 1,
        \"category\": \"pattern\",
        \"difficulty\": \"medium\"
    },
    {
        \"question_text\": \"If you rearrange the letters 'CIFAIPC' you would have the name of a(n):\",
        \"options\": [\"City\", \"Animal\", \"Ocean\", \"Country\"],
        \"correct_answer\": 2,
        \"category\": \"verbal\",
        \"difficulty\": \"hard\"
    },
    {
        \"question_text\": \"What is 7 x 8?\",
        \"options\": [\"54\", \"56\", \"58\", \"52\"],
        \"correct_answer\": 1,
        \"category\": \"math\",
        \"difficulty\": \"easy\"
    },
    {
        \"question_text\": \"What comes next: 100, 50, 25, 12.5, ?\",
        \"options\": [\"6.25\", \"6\", \"7\", \"5\"],
        \"correct_answer\": 0,
        \"category\": \"pattern\",
        \"difficulty\": \"medium\"
    },
    {
        \"question_text\": \"Pen is to Writer as Brush is to ?\",
        \"options\": [\"Paper\", \"Painter\", \"Color\", \"Canvas\"],
        \"correct_answer\": 1,
        \"category\": \"verbal\",
        \"difficulty\": \"easy\"
    },
    {
        \"question_text\": \"If 3x - 7 = 11, what is x?\",
        \"options\": [\"5\", \"6\", \"7\", \"8\"],
        \"correct_answer\": 1,
        \"category\": \"math\",
        \"difficulty\": \"medium\"
    },
    {
        \"question_text\": \"Complete the sequence: 2, 6, 12, 20, 30, ?\",
        \"options\": [\"40\", \"42\", \"44\", \"38\"],
        \"correct_answer\": 1,
        \"category\": \"pattern\",
        \"difficulty\": \"hard\"
    },
    {
        \"question_text\": \"Which word means the opposite of 'Ancient'?\",
        \"options\": [\"Old\", \"Modern\", \"Historic\", \"Antique\"],
        \"correct_answer\": 1,
        \"category\": \"verbal\",
        \"difficulty\": \"easy\"
    },
    {
        \"question_text\": \"What is 25% of 80?\",
        \"options\": [\"15\", \"20\", \"25\", \"30\"],
        \"correct_answer\": 1,
        \"category\": \"math\",
        \"difficulty\": \"easy\"
    },
    {
        \"question_text\": \"Find the next number: 1, 4, 9, 16, 25, ?\",
        \"options\": [\"30\", \"35\", \"36\", \"49\"],
        \"correct_answer\": 2,
        \"category\": \"pattern\",
        \"difficulty\": \"medium\"
    }
]

# ROUTES
@api_router.get(\"/\")
async def root():
    return {\"message\": \"TestIQ API - Intelligence Testing Platform\"}

@api_router.get(\"/stats\")
async def get_stats():
    try:
        total_tests = await db.test_results.count_documents({})
        return {\"total_tests\": total_tests, \"status\": \"operational\"}
    except:
        return {\"total_tests\": 0, \"status\": \"operational\"}

@api_router.post(\"/test/start\")
async def start_test(config: TestConfig):
    num_questions = {
        \"short\": 5,
        \"medium\": 10,
        \"long\": 20
    }.get(config.duration, 10)

    filtered_questions = []
    for q in QUESTIONS_BANK:
        if q[\"difficulty\"] != config.difficulty:
            continue
        if \"all\" not in config.question_types:
            if q[\"category\"] not in config.question_types:
                continue
        filtered_questions.append(q)

    if len(filtered_questions) < num_questions:
        filtered_questions = [
            q for q in QUESTIONS_BANK
            if \"all\" in config.question_types or q[\"category\"] in config.question_types
        ]

    random.shuffle(filtered_questions)
    selected_questions = filtered_questions[:num_questions]

    test_id = str(uuid.uuid4())

    questions_for_frontend = [
        {
            \"id\": str(i),
            \"question_text\": q[\"question_text\"],
            \"options\": q[\"options\"],
            \"category\": q[\"category\"]
        }
        for i, q in enumerate(selected_questions)
    ]

    await db.test_sessions.insert_one({
        \"test_id\": test_id,
        \"questions\": selected_questions,
        \"config\": config.model_dump(),
        \"timestamp\": datetime.now(timezone.utc).isoformat()
    })

    return {
        \"test_id\": test_id,
        \"questions\": questions_for_frontend,
        \"duration_minutes\": num_questions
    }

@api_router.post(\"/test/submit\", response_model=TestResult)
async def submit_test(result: TestResultCreate):
    test_session = await db.test_sessions.find_one({\"test_id\": result.test_id})
    if not test_session:
        raise HTTPException(status_code=404, detail=\"Test session not found\")

    questions = test_session[\"questions\"]
    correct_count = 0

    for i, answer in enumerate(result.answers):
        if i < len(questions) and answer == questions[i][\"correct_answer\"]:
            correct_count += 1

    total_questions = len(questions)
    percentage = (correct_count / total_questions) * 100 if total_questions > 0 else 0

    base_iq = 100
    iq_variation = (percentage - 50) * 0.6
    mock_iq = int(base_iq + iq_variation)
    mock_iq = max(80, min(140, mock_iq))

    test_result = TestResult(
        test_id=result.test_id,
        correct_answers=correct_count,
        total_questions=total_questions,
        iq_score=mock_iq
    )

    result_doc = test_result.model_dump()
    result_doc[\"timestamp\"] = result_doc[\"timestamp\"].isoformat()

    await db.test_results.insert_one(result_doc)

    return test_result

@api_router.post(\"/certificate/download\")
async def download_certificate(cert_request: CertificateRequest):
    test_result = await db.test_results.find_one({\"test_id\": cert_request.test_id})
    if not test_result:
        raise HTTPException(status_code=404, detail=\"Test result not found\")

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Borders
    c.setStrokeColor(colors.HexColor(\"#7c3aed\"))
    c.setLineWidth(3)
    c.rect(40, 40, width - 80, height - 80)

    c.setStrokeColor(colors.HexColor(\"#ec4899\"))
    c.setLineWidth(1)
    c.rect(50, 50, width - 100, height - 100)

    # Title
    c.setFont(\"Helvetica-Bold\", 36)
    c.drawCentredString(width / 2, height - 120, \"Certificate of Achievement\")

    # Subtitle
    c.setFont(\"Helvetica\", 16)
    c.drawCentredString(width / 2, height - 160, \"TestIQ Intelligence Test\")

    # Name
    c.setFont(\"Helvetica-Bold\", 28)
    c.drawCentredString(width / 2, height - 280, cert_request.name)

    # Text
    c.setFont(\"Helvetica\", 14)
    c.drawCentredString(width / 2, height - 340, \"has successfully completed the TestIQ assessment\")

    # Score Label
    c.setFont(\"Helvetica\", 16)
    c.drawCentredString(width / 2, height - 390, \"IQ Score\")

    # Score
    c.setFont(\"Helvetica-Bold\", 40)
    c.setFillColor(colors.HexColor(\"#7c3aed\"))
    c.drawCentredString(width / 2, height - 445, str(test_result[\"iq_score\"]))

    # Footer
    c.setFillColor(colors.black)
    c.setFont(\"Helvetica\", 10)
    c.drawCentredString(width / 2, 80, \"TestIQ - Intelligence Testing Platform\")
    c.drawCentredString(width / 2, 65, f\"Test ID: {cert_request.test_id[:8]}\")

    c.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type=\"application/pdf\",
        headers={
            \"Content-Disposition\":
            f\"attachment; filename=TestIQ_Certificate_{cert_request.name.replace(' ', '_')}.pdf\"
        }
    )

# Add router
app.include_router(api_router)

@app.on_event(\"startup\")
async def startup_event():
    logger.info(\"TestIQ API starting up...\")

@app.on_event(\"shutdown\")
async def shutdown_db_client():
    logger.info(\"TestIQ API shutting down...\")
    client.close()
"