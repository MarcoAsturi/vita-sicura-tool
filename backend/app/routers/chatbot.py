from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from app.chatbot_engine import AIQueryEngine
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY environment variable is not set")
chat_engine_instance = AIQueryEngine(openai_api_key=OPENAI_API_KEY)

@router.post("/chatbot", response_model=ChatResponse)
def query_chatbot(request: ChatRequest):
    try:
        answer = chat_engine_instance.query(request.question)
        return ChatResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
