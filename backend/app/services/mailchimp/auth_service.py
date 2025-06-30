import hashlib
import httpx
from typing import Optional
from app.core.config import settings

class MailchimpAuthService:
    def __init__(self):
        self.api_key = settings.MAILCHIMP_API_KEY
        self.server_prefix = settings.MAILCHIMP_SERVER_PREFIX
        self.list_id = settings.MAILCHIMP_LIST_ID
        self.base_url = f"https://{self.server_prefix}.api.mailchimp.com/3.0"
        
    def _get_auth_header(self) -> dict[str, str]:
        """Get the authorization header for Mailchimp API"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def _get_subscriber_hash(self, email: str) -> str:
        """Generate MD5 hash of the email address (lowercase)"""
        return hashlib.md5(email.lower().encode()).hexdigest()
    
    async def is_subscribed(self, email: str) -> bool:
        """
        Check if an email is subscribed to the Mailchimp list
        
        Args:
            email: Email address to check
            
        Returns:
            True if the email is subscribed, False otherwise
        """
        if not all([self.api_key, self.server_prefix, self.list_id]):
            raise ValueError("Mailchimp configuration is incomplete. Please check your environment variables.")
        
        subscriber_hash = self._get_subscriber_hash(email)
        url = f"{self.base_url}/lists/{self.list_id}/members/{subscriber_hash}"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    headers=self._get_auth_header(),
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("status") == "subscribed"
                elif response.status_code == 404:
                    # Member not found
                    return False
                else:
                    # Other error
                    response.raise_for_status()
                    return False  # This line should never be reached due to raise_for_status()
                    
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    # Member not found
                    return False
                else:
                    # Re-raise other HTTP errors
                    raise e
            except Exception as e:
                raise Exception(f"Failed to check subscription status: {str(e)}")

# Create a singleton instance
auth_service = MailchimpAuthService() 