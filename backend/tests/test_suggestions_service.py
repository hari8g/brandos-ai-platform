import os
from dotenv import load_dotenv
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../.env')))
from app.services.query.suggestions_service import extract_product_info

def test_extract_product_info():
    user_prompt = "I want a gentle anti-aging cream for wrinkles"
    info = extract_product_info(user_prompt)
    assert all(k in info for k in ("product_type", "form", "concern")), f"Missing keys in {info}"
    print("extract_product_info output:", info) 