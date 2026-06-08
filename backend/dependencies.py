from pathlib import Path
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import Header, HTTPException, status

import os
import json

# Initialize Firebase Admin once
_SERVICE_ACCOUNT = Path(__file__).parent / "serviceAccountKey.json"

if not firebase_admin._apps:
    firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS")
    if firebase_creds_json:
        try:
            creds_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(creds_dict)
            firebase_admin.initialize_app(cred)
        except Exception as e:
            raise RuntimeError(f"Failed to initialize Firebase Admin using FIREBASE_CREDENTIALS env var: {e}")
    elif _SERVICE_ACCOUNT.exists():
        cred = credentials.Certificate(str(_SERVICE_ACCOUNT))
        firebase_admin.initialize_app(cred)
    else:
        try:
            # Fallback to default credentials
            firebase_admin.initialize_app()
        except Exception:
            raise RuntimeError(
                "Firebase Admin SDK initialization failed. Neither serviceAccountKey.json was found "
                "nor FIREBASE_CREDENTIALS environment variable was set."
            )


import time

# Simple in-memory token cache to avoid redundant crypto verifications on concurrent requests
# key: token_string -> value: (uid, expiration_timestamp)
_TOKEN_CACHE = {}

async def get_current_uid(authorization: str = Header(...)) -> str:
    """
    Extract and verify Firebase ID token from Authorization header.
    Returns the Firebase UID of the authenticated user.
    Uses an in-memory cache to prevent heavy cryptographic checks on parallel requests.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected: Bearer <token>",
        )
    token = authorization.removeprefix("Bearer ").strip()
    
    now = time.time()
    
    # Check cache
    if token in _TOKEN_CACHE:
        cached_uid, cached_exp = _TOKEN_CACHE[token]
        if now < cached_exp - 60:  # 60s safety buffer
            return cached_uid
        else:
            _TOKEN_CACHE.pop(token, None)
            
    try:
        decoded = firebase_auth.verify_id_token(token)
        uid = decoded["uid"]
        exp = decoded.get("exp", now + 3600)
        
        # Keep cache size small to avoid leaks
        if len(_TOKEN_CACHE) > 500:
            _TOKEN_CACHE.clear()
            
        _TOKEN_CACHE[token] = (uid, exp)
        return uid
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Firebase token: {e}",
        )
