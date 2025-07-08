#!/usr/bin/env python3
"""
Test script for natural flowing prompt generation
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.image_analysis_service import ImageAnalysisService

def test_natural_prompt():
    """Test natural flowing prompt generation"""
    print("🧪 Testing Natural Flowing Prompt Generation...")
    
    image_service = ImageAnalysisService()
    
    # Test user text
    user_text = "I want to create a natural bubble bath and shower gel for clean beauty enthusiasts"
    category = "cosmetics"
    
    # Mock comprehensive image analysis data (based on your example)
    mock_image_analysis = {
        "product_category": "bubble bath and shower gel",
        "intended_use": "cleansing and refreshing the skin during bath or shower",
        "key_ingredients": [
            "96% ingredients from natural origin",
            "natural origin ingredients",
            "plant-based surfactants",
            "essential oils",
            "botanical extracts"
        ],
        "claims": [
            "clean at sephora",
            "natural origin",
            "high percentage of natural origin ingredients"
        ],
        "packaging_type": "bottle with flip-top cap",
        "packaging_size": "260 ml / 8.79 fl. oz.",
        "packaging_material": "plastic",
        "target_audience": "general consumers looking for natural and clean beauty products",
        "brand_style": "modern, clean, and nature-inspired",
        "competitor_positioning": "mid-range, competing with other natural and clean beauty brands",
        "formulation_insights": [
            "likely gentle and suitable for daily use"
        ],
        "consumer_insights": [
            "desire for natural and safe products",
            "preference for clean beauty"
        ],
        "price_positioning": "mid-range",
        "distribution_channels": [
            "available at sephora",
            "likely available online and in-store"
        ],
        "sustainability_aspects": [
            "natural ingredients"
        ],
        "innovation_claims": [],
        "brand_story": "focus on clean and natural beauty",
        "usage_instructions": "use as a bubble bath or shower gel",
        "storage_requirements": "store in a cool, dry place",
        "market_positioning": "emphasizes natural ingredients and clean beauty standards"
    }
    
    # Mock intent data
    mock_intent_data = {
        "product_type_intent": "natural bubble bath and shower gel",
        "target_audience_intent": "clean beauty enthusiasts",
        "benefit_intent": "natural cleansing and refreshing",
        "ingredient_intent": ["natural ingredients", "plant-based"],
        "market_positioning_intent": "clean beauty market"
    }
    
    try:
        # Test natural prompt generation
        natural_prompt = image_service._create_integrated_prompt(mock_intent_data, mock_image_analysis, user_text)
        print(f"✅ Natural Flowing Prompt Generated:")
        print("=" * 80)
        print(natural_prompt)
        print("=" * 80)
        
        # Test with luxury skincare example
        print(f"\n🧪 Testing Luxury Skincare Example...")
        
        luxury_image_analysis = {
            "product_category": "luxury anti-aging face serum",
            "intended_use": "anti-aging, hydration, brightening, and skin rejuvenation",
            "key_ingredients": [
                "hyaluronic acid 2%",
                "vitamin C (ascorbic acid) 15%",
                "peptides (palmitoyl pentapeptide-4)",
                "niacinamide 5%",
                "retinol 0.5%"
            ],
            "claims": [
                "clinically proven anti-aging",
                "paraben-free",
                "cruelty-free",
                "vegan",
                "dermatologist tested"
            ],
            "packaging_type": "airless pump bottle with dropper",
            "packaging_size": "30ml",
            "packaging_material": "glass with gold-plated pump",
            "target_audience": "women aged 30-45, luxury skincare consumers",
            "brand_style": "luxury minimalist with premium positioning",
            "competitor_positioning": "premium anti-aging market leader",
            "formulation_insights": [
                "lightweight, fast-absorbing texture",
                "non-sticky finish",
                "layers well with other products"
            ],
            "consumer_insights": [
                "seeking visible anti-aging results",
                "willing to invest in premium skincare"
            ],
            "price_positioning": "premium luxury ($150-200 range)",
            "distribution_channels": [
                "high-end department stores",
                "luxury beauty retailers"
            ],
            "sustainability_aspects": [
                "recyclable glass packaging",
                "eco-friendly ingredients"
            ],
            "innovation_claims": [
                "patented peptide technology",
                "clinically proven results in 4 weeks"
            ],
            "brand_story": "founded by dermatologists with 20+ years of research",
            "usage_instructions": "apply 2-3 drops morning and evening to clean skin",
            "storage_requirements": "store in cool, dry place, avoid direct sunlight",
            "market_positioning": "premium anti-aging market leader with clinical validation"
        }
        
        luxury_intent_data = {
            "product_type_intent": "luxury anti-aging face serum",
            "target_audience_intent": "women in their 30s",
            "benefit_intent": "anti-aging benefits with natural ingredients",
            "ingredient_intent": ["natural ingredients", "vitamin C", "hyaluronic acid"],
            "market_positioning_intent": "premium luxury skincare"
        }
        
        luxury_prompt = image_service._create_integrated_prompt(luxury_intent_data, luxury_image_analysis, "I want to create a luxury anti-aging face serum for women in their 30s with natural ingredients")
        print(f"✅ Luxury Skincare Natural Prompt:")
        print("=" * 80)
        print(luxury_prompt)
        print("=" * 80)
        
    except Exception as e:
        print(f"❌ Natural prompt test failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting Natural Flowing Prompt Test")
    print("=" * 70)
    
    test_natural_prompt()
    
    print("\n✅ Natural prompt test completed!") 