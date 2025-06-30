from pydantic import BaseModel, EmailStr

class AuthCheckRequest(BaseModel):
    email: EmailStr

class AuthCheckResponse(BaseModel):
    subscribed: bool 