"""Scan result model (placeholder for analyze task)."""

from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class ScanResult:
    input_text: str
    risk_score: float = 0.0
    risk_level: str = "low"
    signals: list[str] = field(default_factory=list)
    ai_summary: str = ""
    created_at: datetime | None = None
