"""Gemini API integration (placeholder)."""


def summarize_risk(text: str, signals: list[str]) -> str:
    """Return AI-generated summary. Wired to Gemini in a later task."""
    if not signals:
        return "No suspicious indicators detected."
    return f"Detected {len(signals)} signal(s) requiring review."
