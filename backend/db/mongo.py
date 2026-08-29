"""MongoDB connection helpers (wired up in later tasks)."""

from pymongo import MongoClient
from pymongo.database import Database

from config import Config

_client: MongoClient | None = None


def get_client() -> MongoClient:
    global _client
    if _client is None:
        _client = MongoClient(Config.MONGODB_URI)
    return _client


def get_db() -> Database:
    return get_client().get_default_database()
