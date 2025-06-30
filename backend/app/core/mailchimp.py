import hashlib
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

class MailchimpClient:
    def __init__(self):
        self.api_key = settings.MAILCHIMP_API_KEY
        self.server_prefix = settings.MAILCHIMP_SERVER_PREFIX
        self.list_id = settings.MAILCHIMP_LIST_ID
        self.base_url = f"https://{self.server_prefix}.api.mailchimp.com/3.0"
        
        # Debug logging
        print(f"🔧 Mailchimp Config Debug:")
        print(f"   API Key: {'✅ Set' if self.api_key else '❌ Missing'}")
        print(f"   Server Prefix: {'✅ Set' if self.server_prefix else '❌ Missing'}")
        print(f"   List ID: {'✅ Set' if self.list_id else '❌ Missing'}")
        
    def _get_auth_header(self) -> Dict[str, str]:
        """Get the authorization header for Mailchimp API"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def _get_subscriber_hash(self, email: str) -> str:
        """Generate MD5 hash of the email address (lowercase)"""
        return hashlib.md5(email.lower().encode()).hexdigest()
    
    async def subscribe_member(self, email: str, merge_fields: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Subscribe a member to the Mailchimp list
        
        Args:
            email: Email address to subscribe
            merge_fields: Optional merge fields (FNAME, LNAME, etc.)
            
        Returns:
            Dict containing the API response
        """
        if not all([self.api_key, self.server_prefix, self.list_id]):
            raise ValueError("Mailchimp configuration is incomplete. Please check your environment variables.")
        
        subscriber_hash = self._get_subscriber_hash(email)
        url = f"{self.base_url}/lists/{self.list_id}/members/{subscriber_hash}"
        
        payload = {
            "email_address": email,
            "status_if_new": "subscribed",
            "status": "subscribed"
        }
        
        if merge_fields:
            payload["merge_fields"] = merge_fields
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.put(
                    url,
                    json=payload,
                    headers=self._get_auth_header(),
                    timeout=30.0
                )
                
                response.raise_for_status()
                return response.json()
                
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 400:
                    error_data = e.response.json()
                    if "title" in error_data and "Member Exists" in error_data["title"]:
                        # Member already exists, return success
                        return {
                            "id": subscriber_hash,
                            "email_address": email,
                            "status": "subscribed",
                            "merge_fields": merge_fields or {}
                        }
                raise e
            except Exception as e:
                raise Exception(f"Failed to subscribe to Mailchimp: {str(e)}")

# Create a singleton instance
mailchimp_client = MailchimpClient() 