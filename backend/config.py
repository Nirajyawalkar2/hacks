import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    JWT_SECRET = os.getenv("JWT_SECRET", "dev-jwt-secret")
    JWT_EXPIRATION = timedelta(hours=24)

    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/phishguard")

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
