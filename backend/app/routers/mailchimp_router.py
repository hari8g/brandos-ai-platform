"""
FastAPI router for Mailchimp subscription
"""
from fastapi import APIRouter, HTTPException
from app.models.mailchimp import SubscribeRequest, SubscribeResponse
from app.services.mailchimp.subscribe_service import subscribe_member

router = APIRouter(prefix="/mailchimp", tags=["mailchimp"])

@router.post("/subscribe", response_model=SubscribeResponse)
async def subscribe_endpoint(request: SubscribeRequest):
    """Subscribe a user to the Mailchimp list"""
    try:
        response = await subscribe_member(request)
        
        if not response.success:
            raise HTTPException(
                status_code=400,
                detail=response.error or "Failed to subscribe"
            )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        ) 