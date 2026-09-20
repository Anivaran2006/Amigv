import hashlib
import re
from typing import Tuple

def compute_content_hash(text: str) -> str:
    """
    Computes a normalized SHA-256 hash of text content,
    ignoring superficial whitespace or timestamp jitter.
    """
    # Normalize whitespace and case
    normalized = re.sub(r'\s+', ' ', text.strip().lower())
    return hashlib.sha256(normalized.encode('utf-8')).hexdigest()

def has_content_changed(previous_hash: str, new_content: str) -> Tuple[bool, str]:
    """
    Compares the previous hash with the new content's hash.
    Returns (changed: bool, new_hash: str).
    """
    new_hash = compute_content_hash(new_content)
    if not previous_hash:
        return True, new_hash
    return previous_hash != new_hash, new_hash
