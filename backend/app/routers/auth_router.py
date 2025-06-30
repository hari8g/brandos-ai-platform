from fastapi import APIRouter, HTTPException
from app.models.auth import AuthCheckRequest, AuthCheckResponse
from app.services.mailchimp.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/check", response_model=AuthCheckResponse)
async def check_subscription(request: AuthCheckRequest):
    """Check if an email is subscribed to the newsletter"""
    try:
        subscribed = await auth_service.is_subscribed(request.email)
        return AuthCheckResponse(subscribed=subscribed)
    except Exception as e:
        # Log the error for debugging
        print(f"Error checking subscription for {request.email}: {str(e)}")
        raise HTTPException(
            status_code=502,
            detail="Unable to check subscription status. Please try again later."
        ) 