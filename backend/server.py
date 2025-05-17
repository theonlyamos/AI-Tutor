from fastapi import FastAPI, APIRouter, HTTPException, Depends, Body, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
import logging
import uuid
import json
import base64
import io
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Set up Google Generative AI
genai.configure(api_key="AIzaSyAz606O_FIDxZaieX2CFzyHGfTOXj0zK00")
generation_config = {
    "temperature": 0.9,
    "top_p": 1,
    "top_k": 1,
    "max_output_tokens": 2048,
}
model = genai.GenerativeModel(
    model_name="gemini-1.5-pro-latest",
    generation_config=generation_config
)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define Models
class Student(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    grade: Optional[str] = None
    interests: Optional[List[str]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StudentCreate(BaseModel):
    name: str
    grade: Optional[str] = None
    interests: Optional[List[str]] = None

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    content: str
    role: str  # "student" or "tutor"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MessageCreate(BaseModel):
    student_id: str
    content: str
    role: str

class ProgressRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    module_id: str
    module_name: str
    completed: bool = False
    score: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Module(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    subject: str
    difficulty: int
    locked: bool = True
    requirements: Optional[List[str]] = None

class VideoFrame(BaseModel):
    student_id: str
    frame_data: str  # Base64 encoded image data

# API Routes

@api_router.get("/")
async def root():
    return {"message": "Synthesis Tutor 2.0 API is running"}

@api_router.post("/students", response_model=Student)
async def create_student(input: StudentCreate):
    student_dict = input.dict()
    student_obj = Student(**student_dict)
    await db.students.insert_one(student_obj.dict())
    return student_obj

@api_router.get("/students/{student_id}", response_model=Student)
async def get_student(student_id: str):
    student = await db.students.find_one({"id": student_id})
    if student:
        return Student(**student)
    raise HTTPException(status_code=404, detail="Student not found")

@api_router.post("/messages", response_model=Message)
async def create_message(message: MessageCreate):
    message_obj = Message(**message.dict())
    await db.messages.insert_one(message_obj.dict())
    return message_obj

@api_router.get("/messages/{student_id}", response_model=List[Message])
async def get_messages(student_id: str):
    messages = await db.messages.find({"student_id": student_id}).sort("timestamp", 1).to_list(100)
    return [Message(**msg) for msg in messages]

@api_router.post("/chat", response_model=Dict[str, Any])
async def chat_with_tutor(
    student_id: str = Body(...),
    message: str = Body(...),
    context: Optional[List[Dict[str, str]]] = Body(default=[])
):
    # Retrieve student information for personalization
    student = await db.students.find_one({"id": student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Add the student message to the database
    student_message = Message(
        student_id=student_id,
        content=message,
        role="student"
    )
    await db.messages.insert_one(student_message.dict())

    # Format context for the AI model (previous conversation)
    chat_context = []
    if context:
        for msg in context:
            if msg["role"] == "student":
                chat_context.append({"role": "user", "parts": [msg["content"]]})
            else:
                chat_context.append({"role": "model", "parts": [msg["content"]]})
    
    # Add current message
    chat_context.append({"role": "user", "parts": [message]})
    
    # Prepare chat context
    if not context:
        # Add personalized prompt as the first "model" message instead of system prompt
        # (Gemini doesn't support system role)
        personalized_prompt = f"""You are Synthesis Tutor 2.0, an AI tutor for a student named {student['name']}. 
        Your goal is to be helpful, supportive, and personalized in your teaching approach.
        Keep your answers friendly and conversational for a student in grade {student.get('grade', 'school')}.
        Explain concepts clearly and provide interactive examples when possible.
        """
        
        # Initialize the chat with an empty history
        chat = model.start_chat(history=[])
        
        # Send the personalized prompt as a hidden "instruction" message
        # Then we'll use the regular message
        instruction_response = chat.send_message(
            f"Please respond to the student as if you are an AI tutor with these instructions: {personalized_prompt}"
        )
    else:
        chat = model.start_chat(history=chat_context[:-1])

    # Generate response from AI
    response = chat.send_message(message)
    tutor_response = response.text
    
    # Save the tutor's response to the database
    tutor_message = Message(
        student_id=student_id,
        content=tutor_response,
        role="tutor"
    )
    await db.messages.insert_one(tutor_message.dict())
    
    return {
        "response": tutor_response,
        "student_id": student_id
    }

@api_router.get("/modules", response_model=List[Module])
async def get_modules():
    modules = await db.modules.find().to_list(100)
    if not modules:
        # If no modules exist, create default ones
        default_modules = [
            Module(
                id=str(uuid.uuid4()),
                name="Introduction to Numbers",
                description="Learn about numbers and basic operations",
                subject="Math",
                difficulty=1,
                locked=False,
            ),
            Module(
                id=str(uuid.uuid4()),
                name="Reading Comprehension",
                description="Improve your understanding of written text",
                subject="English",
                difficulty=1,
                locked=False,
            ),
            Module(
                id=str(uuid.uuid4()),
                name="Basic Science Concepts",
                description="Introduction to science fundamentals",
                subject="Science",
                difficulty=1,
                locked=False,
            ),
            Module(
                id=str(uuid.uuid4()),
                name="Advanced Mathematics",
                description="Complex math operations and problem solving",
                subject="Math",
                difficulty=3,
                locked=True,
                requirements=["Introduction to Numbers"]
            ),
        ]
        for module in default_modules:
            await db.modules.insert_one(module.dict())
        return default_modules
    
    return [Module(**module) for module in modules]

@api_router.post("/progress", response_model=ProgressRecord)
async def update_progress(
    student_id: str = Body(...),
    module_id: str = Body(...),
    module_name: str = Body(...),
    completed: bool = Body(...),
    score: Optional[float] = Body(None)
):
    # Check if progress record exists
    existing_record = await db.progress.find_one({
        "student_id": student_id,
        "module_id": module_id
    })
    
    if existing_record:
        # Update existing record
        update_data = {"completed": completed}
        if score is not None:
            update_data["score"] = score
        
        await db.progress.update_one(
            {"id": existing_record["id"]},
            {"$set": update_data}
        )
        
        # Get updated record
        updated_record = await db.progress.find_one({"id": existing_record["id"]})
        return ProgressRecord(**updated_record)
    else:
        # Create new progress record
        progress_record = ProgressRecord(
            student_id=student_id,
            module_id=module_id,
            module_name=module_name,
            completed=completed,
            score=score
        )
        await db.progress.insert_one(progress_record.dict())
        return progress_record

@api_router.get("/progress/{student_id}", response_model=List[ProgressRecord])
async def get_student_progress(student_id: str):
    progress_records = await db.progress.find({"student_id": student_id}).to_list(100)
    return [ProgressRecord(**record) for record in progress_records]

@api_router.post("/process-video-frame", response_model=Dict[str, Any])
async def process_video_frame(video_frame: VideoFrame):
    """
    Process a video frame from the student's camera.
    This endpoint can be used to analyze student behavior, engagement, etc.
    """
    # Extract the base64 data and convert to binary
    try:
        # Remove the "data:image/jpeg;base64," prefix if present
        if "," in video_frame.frame_data:
            _, frame_data = video_frame.frame_data.split(",", 1)
        else:
            frame_data = video_frame.frame_data
            
        # Decode base64 to binary data
        binary_data = base64.b64decode(frame_data)
        
        # In a real implementation, we would analyze the image with
        # computer vision or send it to the AI model
        # For now, we'll just store a record of the frame
        
        frame_record = {
            "id": str(uuid.uuid4()),
            "student_id": video_frame.student_id,
            "timestamp": datetime.utcnow(),
            "processed": True
        }
        
        await db.video_frames.insert_one(frame_record)
        
        # Optionally, we could use the video frame in our AI context
        # by sending it to the Gemini model along with any text
        
        return {
            "status": "success",
            "message": "Video frame processed successfully",
            "frame_id": frame_record["id"]
        }
    except Exception as e:
        logger.error(f"Error processing video frame: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing video frame: {str(e)}"
        )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
