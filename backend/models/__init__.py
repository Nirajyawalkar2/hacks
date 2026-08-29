"""Models package for PhishGuard."""
from .scan_store import add_scan, get_all_scans, get_scan_by_id, clear_scans

__all__ = ["add_scan", "get_all_scans", "get_scan_by_id", "clear_scans"]
