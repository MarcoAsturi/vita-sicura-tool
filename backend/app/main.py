from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from app.routers import clienti, chatbot
import os

import logging

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
