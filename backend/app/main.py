from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from app.routers import clienti, chatbot, voice_assistant, notes, polizze
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(default_response_class=ORJSONResponse)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("ALLOWED_CORS_ORIGINS")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clienti.router)
app.include_router(chatbot.router)
app.include_router(voice_assistant.router)
app.include_router(notes.router)
app.include_router(polizze.router)