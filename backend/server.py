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
from contextlib import asynccontextmanager

# Configure logging first as it's used early
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Set up Google Generative AI
google_api_key = os.getenv("GOOGLE_AI_API_KEY")
if not google_api_key:
    logger.error("GOOGLE_AI_API_KEY not found in environment variables. Please set it in backend/.env")
    raise ValueError("GOOGLE_AI_API_KEY not found in environment variables.")
genai.configure(api_key=google_api_key)

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

@asynccontextmanager
async def lifespan(app_instance: FastAPI):
    # Startup logic can go here if needed
    logger.info("Application startup: MongoDB client initialized.")
    yield
    # Shutdown logic
    logger.info("Application shutdown: Closing MongoDB client.")
    client.close()

# Create the main app with the lifespan manager
app = FastAPI(lifespan=lifespan)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

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
    frame_data: str  # Base64 encoded data
    mime_type: Optional[str] = "video/webm" # Default to video/webm, will be sent by frontend

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

VIDEO_UPLOADS_DIR = ROOT_DIR / "video_uploads"

@api_router.post("/process-video-frame", response_model=Dict[str, Any])
async def process_video_frame(video_frame_input: VideoFrame):
    """
    Process a video/audio frame chunk from the student's camera.
    Saves the chunk to a file.
    """
    try:
        student_id = video_frame_input.student_id
        base64_data = video_frame_input.frame_data
        mime_type = video_frame_input.mime_type

        # Ensure student-specific directory exists
        student_video_dir = VIDEO_UPLOADS_DIR / student_id
        student_video_dir.mkdir(parents=True, exist_ok=True)

        # Remove the data URL prefix if present (e.g., "data:video/webm;base64,")
        if "," in base64_data:
            meta, actual_base64_data = base64_data.split(",", 1)
        else:
            actual_base64_data = base64_data
            
        # Decode base64 to binary data
        binary_data = base64.b64decode(actual_base64_data)

        # Generate a unique filename for the chunk
        timestamp_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")
        file_extension = mime_type.split("/")[-1] if mime_type else "webm"
        # Sanitize file extension if necessary, e.g., remove codecs part for ; codecs=vp8,opus
        if ";" in file_extension:
            file_extension = file_extension.split(";")[0]

        chunk_filename = f"{timestamp_str}.{file_extension}"
        chunk_filepath = student_video_dir / chunk_filename

        # Write the binary data to the file
        with open(chunk_filepath, "wb") as f:
            f.write(binary_data)

        # Log to database (optional, can be adapted)
        # The old frame_record was for images and stored in db.video_frames
        # For video chunks, you might want a different collection or structure
        video_chunk_record = {
            "id": str(uuid.uuid4()),
            "student_id": student_id,
            "timestamp": datetime.utcnow(),
            "mime_type": mime_type,
            "filepath": str(chunk_filepath), # Store relative or absolute path
            "filename": chunk_filename,
            "size_bytes": len(binary_data)
        }
        await db.video_chunks.insert_one(video_chunk_record) # Using a new collection "video_chunks"

        return {
            "status": "success",
            "message": "Video chunk processed and saved successfully",
            "chunk_id": video_chunk_record["id"],
            "filename": chunk_filename
        }
    except Exception as e:
        logger.error(f"Error processing video frame: {str(e)}", exc_info=True)
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
