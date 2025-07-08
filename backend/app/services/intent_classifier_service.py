import os
from typing import Dict, Any, List, Optional
from openai import OpenAI
from dotenv import load_dotenv
import json

# Load environment variables from the root .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

class IntentClassifierService:
    """Service for classifying user intent from text input"""
    
    def __init__(self):
        self.client = None
        try:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key and api_key != "your_openai_api_key_here" and api_key.strip():
                self.client = OpenAI(api_key=api_key)
                print("✅ Intent Classifier Service: OpenAI client initialized")
            else:
                print("⚠️ Intent Classifier Service: OpenAI API key not found")
        except Exception as e:
            print(f"⚠️ Intent Classifier Service: Failed to initialize OpenAI client: {e}")
    
    def classify_intent(self, user_text: str, category: Optional[str] = None) -> Dict[str, Any]:
        """Classify user intent from text input"""
        try:
            if not self.client:
                return self._generate_mock_intent(user_text, category)
            
            # Create intent classification prompt
            classification_prompt = self._create_intent_prompt(user_text, category)
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert product formulation intent classifier. Analyze user text and extract their specific intent for product development."
                    },
                    {
                        "role": "user",
                        "content": classification_prompt
                    }
                ],
                max_tokens=500,
                temperature=0.3
            )
            
            # Parse the response
            intent_text = response.choices[0].message.content
            intent_data = self._parse_intent_response(intent_text)
            
            return intent_data
            
        except Exception as e:
            print(f"❌ Intent classification error: {e}")
            return self._generate_mock_intent(user_text, category)
    
    def _create_intent_prompt(self, user_text: str, category: Optional[str] = None) -> str:
        """Create a prompt for intent classification"""
        base_prompt = f"""
        Analyze this user text and classify their intent for product formulation:

        User text: "{user_text}"
        Product category: {category or "general"}

        Please classify the user's intent into these categories:

        1. PRODUCT_TYPE_INTENT: What type of product do they want to create?
        2. TARGET_AUDIENCE_INTENT: Who is their target audience?
        3. BENEFIT_INTENT: What benefit or effect do they want to achieve?
        4. INGREDIENT_INTENT: Any specific ingredients they want to include or avoid?
        5. FORMULATION_INTENT: Any specific formulation requirements?
        6. MARKET_POSITIONING_INTENT: How do they want to position the product?
        7. PACKAGING_INTENT: Any packaging preferences?
        8. BUDGET_INTENT: Any budget or cost considerations?
        9. COMPETITOR_INTENT: Any competitor references or positioning?
        10. SUSTAINABILITY_INTENT: Any sustainability or eco-friendly requirements?

        Format your response as JSON with these exact keys:
        {{
            "product_type_intent": "string (what product type they want)",
            "target_audience_intent": "string (who they're targeting)",
            "benefit_intent": "string (what benefit they want)",
            "ingredient_intent": ["array of ingredient preferences"],
            "formulation_intent": "string (any formulation requirements)",
            "market_positioning_intent": "string (how they want to position it)",
            "packaging_intent": "string (any packaging preferences)",
            "budget_intent": "string (any budget considerations)",
            "competitor_intent": "string (any competitor references)",
            "sustainability_intent": "string (any sustainability requirements)",
            "confidence_score": "number (0-1, how confident in the classification)",
            "primary_intent": "string (the main intent category)"
        }}
        """
        return base_prompt
    
    def _parse_intent_response(self, response_text: str) -> Dict[str, Any]:
        """Parse the OpenAI response into structured intent data"""
        try:
            # Try to extract JSON from the response
            if "{" in response_text and "}" in response_text:
                start = response_text.find("{")
                end = response_text.rfind("}") + 1
                json_str = response_text[start:end]
                return json.loads(json_str)
            else:
                # Fallback parsing
                return self._fallback_intent_parse(response_text)
        except Exception as e:
            print(f"⚠️ Failed to parse intent response: {e}")
            return self._fallback_intent_parse(response_text)
    
    def _fallback_intent_parse(self, response_text: str) -> Dict[str, Any]:
        """Fallback parsing for non-JSON responses"""
        lines = response_text.split('\n')
        result = {
            "product_type_intent": "general product",
            "target_audience_intent": "general audience",
            "benefit_intent": "standard benefits",
            "ingredient_intent": [],
            "formulation_intent": "standard formulation",
            "market_positioning_intent": "competitive positioning",
            "packaging_intent": "standard packaging",
            "budget_intent": "standard budget",
            "competitor_intent": "competitive market",
            "sustainability_intent": "standard sustainability",
            "confidence_score": 0.5,
            "primary_intent": "product_development"
        }
        
        for line in lines:
            line = line.strip()
            if "product" in line.lower() and "type" in line.lower():
                result["product_type_intent"] = line.split(":")[-1].strip()
            elif "target" in line.lower() and "audience" in line.lower():
                result["target_audience_intent"] = line.split(":")[-1].strip()
            elif "benefit" in line.lower():
                result["benefit_intent"] = line.split(":")[-1].strip()
            elif "ingredient" in line.lower():
                result["ingredient_intent"].append(line.split(":")[-1].strip())
        
        return result
    
    def _generate_mock_intent(self, user_text: str, category: Optional[str] = None) -> Dict[str, Any]:
        """Generate mock intent data for testing"""
        return {
            "product_type_intent": f"{category or 'general'} product",
            "target_audience_intent": "general consumers",
            "benefit_intent": "standard benefits",
            "ingredient_intent": ["natural ingredients"],
            "formulation_intent": "standard formulation",
            "market_positioning_intent": "competitive positioning",
            "packaging_intent": "standard packaging",
            "budget_intent": "standard budget",
            "competitor_intent": "competitive market",
            "sustainability_intent": "standard sustainability",
            "confidence_score": 0.7,
            "primary_intent": "product_development"
        } 