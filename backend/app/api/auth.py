from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core.deps import create_access_token
from app.core.config import settings
from pydantic import BaseModel

router = APIRouter()

class Token(BaseModel):
    access_token: str
    token_type: str

class PhoneNumber(BaseModel):
    phone: str
    country_code: str = "91"  # Default to India

@router.post("/auth/verify-phone")
async def verify_phone(phone_data: PhoneNumber):
    """
    Send OTP to phone number
    """
    # TODO: Implement actual OTP sending
    # For now, always return success
    return {"message": "OTP sent successfully"}

@router.post("/auth/verify-otp")
async def verify_otp(phone: str, otp: str):
    """
    Verify OTP and return access token
    """
    # TODO: Implement actual OTP verification
    # For now, accept any 6-digit OTP
    if not otp.isdigit() or len(otp) != 6:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP format"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": phone},
        expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")