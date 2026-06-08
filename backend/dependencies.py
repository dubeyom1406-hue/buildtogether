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


async def get_current_uid(authorization: str = Header(...)) -> str:
    """
    Extract and verify Firebase ID token from Authorization header.
    Returns the Firebase UID of the authenticated user.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected: Bearer <token>",
        )
    token = authorization.removeprefix("Bearer ").strip()
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded["uid"]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Firebase token: {e}",
        )
