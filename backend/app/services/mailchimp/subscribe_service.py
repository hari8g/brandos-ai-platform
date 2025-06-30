from datetime import datetime
from app.core.mailchimp import mailchimp_client
from app.models.mailchimp import SubscribeRequest, SubscribeResponse

async def subscribe_member(request: SubscribeRequest) -> SubscribeResponse:
    """
    Subscribe a member to the Mailchimp list
    
    Args:
        request: SubscribeRequest containing email and name fields
        
    Returns:
        SubscribeResponse with subscription details
    """
    try:
        # Prepare merge fields for Mailchimp
        merge_fields = {
            "FNAME": request.first_name,
            "LNAME": request.last_name or "",
            "COMPANY": request.company
        }
        
        # Call Mailchimp API
        response = await mailchimp_client.subscribe_member(
            email=request.email,
            merge_fields=merge_fields
        )
        
        # Parse the response
        return SubscribeResponse(
            id=response.get("id", ""),
            email=response.get("email_address", request.email),
            status=response.get("status", "subscribed"),
            created_at=datetime.now(),
            success=True,
            message="Successfully subscribed to our newsletter!"
        )
        
    except ValueError as e:
        # Configuration error
        return SubscribeResponse(
            id="",
            email=request.email,
            status="error",
            success=False,
            message="Subscription service is not configured",
            error=str(e)
        )
        
    except Exception as e:
        # Other errors
        return SubscribeResponse(
            id="",
            email=request.email,
            status="error",
            success=False,
            message="Failed to subscribe. Please try again.",
            error=str(e)
        ) 