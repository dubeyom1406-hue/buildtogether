from pathlib import Path
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import Header, HTTPException, status

# Initialize Firebase Admin once
_SERVICE_ACCOUNT = Path(__file__).parent / "serviceAccountKey.json"

if not firebase_admin._apps:
    if _SERVICE_ACCOUNT.exists():
        cred = credentials.Certificate(str(_SERVICE_ACCOUNT))
        firebase_admin.initialize_app(cred)
    else:
        raise RuntimeError(
            "serviceAccountKey.json not found in backend/. "
            "Download it from Firebase Console → Project Settings → Service Accounts."
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
