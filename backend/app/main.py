from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from app.routers import clienti, chatbot
import os

import logging

logging.basicConfig(level=logging.INFO)
logging.info(f"Allowed CORS origins: {os.environ.get('ALLOWED_CORS_ORIGINS')}")

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
