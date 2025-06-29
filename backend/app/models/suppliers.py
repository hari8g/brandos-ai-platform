from pydantic import BaseModel
from typing import List, Optional

class Supplier(BaseModel):
    name: str
    location: str
    rating: float
    contact: Optional[str] = None
    website: Optional[str] = None

class SupplierRequest(BaseModel):
    ingredients: List[str]
    location: Optional[str] = None

class SupplierResponse(BaseModel):
    suppliers: List[Supplier]
    total_count: int 