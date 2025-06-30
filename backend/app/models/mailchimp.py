from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class SubscribeRequest(BaseModel):
    email: EmailStr
    first_name: str
    last_name: Optional[str] = ""
    company: str

class SubscribeResponse(BaseModel):
    id: str
    email: EmailStr
    status: str
    created_at: Optional[datetime] = None
    success: bool = True
    message: str = "Successfully subscribed"
    error: Optional[str] = None 