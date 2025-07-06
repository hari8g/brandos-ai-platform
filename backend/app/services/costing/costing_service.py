from app.models.generate import GenerateResponse
from app.models.costing import ManufacturingScenario, ManufacturingInsights, ManufacturingRequest, ManufacturingResponse, CostingBreakdown
from typing import List, Dict
import json
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables from the root .env file
# The .env file is in the project root (one level up from backend)
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

# Initialize OpenAI client
client = None
try:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key != "your_openai_api_key_here" and api_key.strip():
        client = OpenAI(api_key=api_key)
        print("✅ OpenAI client initialized successfully for costing service")
        print(f"🔍 API Key found: {'Yes' if api_key else 'No'}")
        if api_key:
            print(f"🔍 API Key length: {len(api_key)}")
    else:
        print("⚠️ OpenAI API key not found for costing service, will use fallback data")
except Exception as e:
    print(f"⚠️ Failed to initialize OpenAI client for costing service: {e}")

def create_costing_prompt(formulation: GenerateResponse, category: str) -> str:
    """
    Create a comprehensive prompt for costing analysis.
    """
    prompt = f"""
    You are a senior manufacturing and financial analyst specializing in {category} production in India.
    
    Analyze the following formulation and provide detailed costing analysis for three manufacturing scales:
    
    PRODUCT: {formulation.product_name}
    CATEGORY: {category}
    INGREDIENTS: {', '.join([f"{ing.name} ({ing.percent}%)" for ing in formulation.ingredients])}
    
    Provide a comprehensive costing analysis including:
    
    1. CAPEX (Capital Expenditure) - Equipment, machinery, facility setup
    2. OPEX (Operational Expenditure) - Raw materials, labor, utilities, packaging
    3. Pricing Strategy - Wholesale and retail pricing
    4. Margin Analysis - Profit margins and break-even analysis
    
    For each scale (Small: 1,000 customers, Medium: 10,000 customers, Large: 50,000+ customers),
    provide realistic Indian market costs and pricing.
    
    Return the analysis as a JSON object with the following structure:
    {{
        "small_scale": {{
            "batch_size": 1000,
            "total_customers": 1000,
            "costing_breakdown": {{
                "capex": 500000,
                "opex": 150000,
                "total_cost": 650000,
                "cost_per_unit": 650,
                "retail_price": 1200,
                "wholesale_price": 900,
                "profit_margin": 45.5,
                "revenue_potential": 1200000,
                "break_even_customers": 542
            }},
            "capex_details": {{
                "equipment": 200000,
                "machinery": 150000,
                "facility_setup": 100000,
                "quality_control": 50000
            }},
            "opex_details": {{
                "raw_materials": 80000,
                "labor": 30000,
                "utilities": 15000,
                "packaging": 15000,
                "quality_assurance": 10000
            }},
            "pricing_strategy": {{
                "wholesale_markup": "30%",
                "retail_markup": "85%",
                "competitive_positioning": "Premium",
                "target_margin": "45%"
            }},
            "margin_analysis": {{
                "gross_margin": 45.5,
                "operating_margin": 35.2,
                "net_margin": 28.8,
                "break_even_point": 542
            }}
        }},
        "medium_scale": {{
            "batch_size": 10000,
            "total_customers": 10000,
            "costing_breakdown": {{
                "capex": 1200000,
                "opex": 800000,
                "total_cost": 2000000,
                "cost_per_unit": 200,
                "retail_price": 450,
                "wholesale_price": 320,
                "profit_margin": 55.6,
                "revenue_potential": 4500000,
                "break_even_customers": 4444
            }},
            "capex_details": {{
                "equipment": 400000,
                "machinery": 350000,
                "facility_setup": 250000,
                "quality_control": 200000
            }},
            "opex_details": {{
                "raw_materials": 400000,
                "labor": 150000,
                "utilities": 80000,
                "packaging": 100000,
                "quality_assurance": 70000
            }},
            "pricing_strategy": {{
                "wholesale_markup": "60%",
                "retail_markup": "125%",
                "competitive_positioning": "Mid-Premium",
                "target_margin": "55%"
            }},
            "margin_analysis": {{
                "gross_margin": 55.6,
                "operating_margin": 45.3,
                "net_margin": 38.9,
                "break_even_point": 4444
            }}
        }},
        "large_scale": {{
            "batch_size": 50000,
            "total_customers": 50000,
            "costing_breakdown": {{
                "capex": 2500000,
                "opex": 3000000,
                "total_cost": 5500000,
                "cost_per_unit": 110,
                "retail_price": 280,
                "wholesale_price": 200,
                "profit_margin": 60.7,
                "revenue_potential": 14000000,
                "break_even_customers": 19643
            }},
            "capex_details": {{
                "equipment": 800000,
                "machinery": 700000,
                "facility_setup": 500000,
                "quality_control": 500000
            }},
            "opex_details": {{
                "raw_materials": 1500000,
                "labor": 500000,
                "utilities": 300000,
                "packaging": 400000,
                "quality_assurance": 300000
            }},
            "pricing_strategy": {{
                "wholesale_markup": "82%",
                "retail_markup": "155%",
                "competitive_positioning": "Mass Premium",
                "target_margin": "60%"
            }},
            "margin_analysis": {{
                "gross_margin": 60.7,
                "operating_margin": 52.4,
                "net_margin": 45.1,
                "break_even_point": 19643
            }}
        }},
        "scaling_benefits": [
            "Economies of scale reduce per-unit costs by 40-70%",
            "Bulk purchasing power for raw materials and packaging",
            "Automated manufacturing processes become viable",
            "Distribution networks become more efficient",
            "Marketing costs spread across larger customer base"
        ],
        "risk_factors": [
            "Higher upfront investment required for scaling",
            "Increased inventory management complexity",
            "Need for larger storage and distribution facilities",
            "Market demand uncertainty at larger scales",
            "Competition intensifies with scale"
        ],
        "market_opportunity": "Manufacturing {formulation.product_name} presents a scalable opportunity with potential revenue of ₹14,000,000 at full scale, requiring strategic scaling decisions based on market demand and capital availability."
    }}
    
    Guidelines:
    - Use realistic Indian market costs and pricing
    - Consider category-specific requirements (cosmetics, pet food, wellness)
    - Include detailed breakdowns for CAPEX and OPEX
    - Provide competitive pricing strategies
    - Calculate realistic profit margins and break-even points
    - Consider economies of scale effects
    """
    return prompt

def fetch_costing_from_openai(formulation: GenerateResponse, category: str) -> dict:
    """
    Fetch costing analysis from OpenAI.
    """
    if not client:
        print("❌ OpenAI client not available, using fallback costing")
        return generate_fallback_costing(formulation, category)
    
    try:
        prompt = create_costing_prompt(formulation, category)
        
        print("📤 Sending costing request to OpenAI...")
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are a senior manufacturing and financial analyst specializing in product costing and pricing strategies."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=4000
        )
        
        print("📥 Received costing response from OpenAI")
        content = response.choices[0].message.content
        
        # Try to parse JSON from the response
        try:
            # Extract JSON from the response if it's wrapped in markdown
            if "```json" in content:
                json_start = content.find("```json") + 7
                json_end = content.find("```", json_start)
                json_content = content[json_start:json_end].strip()
            else:
                json_content = content.strip()
            
            costing_data = json.loads(json_content)
            print("✅ Successfully parsed costing data from OpenAI")
            return costing_data
            
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse JSON from OpenAI response: {e}")
            print(f"Raw response: {content}")
            return generate_fallback_costing(formulation, category)
            
    except Exception as e:
        print(f"❌ Error fetching costing from OpenAI: {e}")
        return generate_fallback_costing(formulation, category)

def generate_fallback_costing(formulation: GenerateResponse, category: str) -> dict:
    """
    Generate fallback costing data when OpenAI is unavailable.
    """
    print("🔄 Generating fallback costing data")
    
    # Base costs vary by category
    category_multipliers = {
        "cosmetics": {"capex": 1.0, "opex": 1.0, "pricing": 1.0},
        "pet food": {"capex": 0.8, "opex": 0.7, "pricing": 0.6},
        "wellness": {"capex": 1.2, "opex": 1.1, "pricing": 1.3}
    }
    
    multiplier = category_multipliers.get(category.lower(), category_multipliers["cosmetics"])
    
    return {
        "small_scale": {
            "batch_size": 1000,
            "total_customers": 1000,
            "costing_breakdown": {
                "capex": 500000 * multiplier["capex"],
                "opex": 150000 * multiplier["opex"],
                "total_cost": (500000 + 150000) * multiplier["capex"],
                "cost_per_unit": 650 * multiplier["opex"],
                "retail_price": 1200 * multiplier["pricing"],
                "wholesale_price": 900 * multiplier["pricing"],
                "profit_margin": 45.5,
                "revenue_potential": 1200000 * multiplier["pricing"],
                "break_even_customers": 542
            },
            "capex_details": {
                "equipment": 200000 * multiplier["capex"],
                "machinery": 150000 * multiplier["capex"],
                "facility_setup": 100000 * multiplier["capex"],
                "quality_control": 50000 * multiplier["capex"]
            },
            "opex_details": {
                "raw_materials": 80000 * multiplier["opex"],
                "labor": 30000 * multiplier["opex"],
                "utilities": 15000 * multiplier["opex"],
                "packaging": 15000 * multiplier["opex"],
                "quality_assurance": 10000 * multiplier["opex"]
            },
            "pricing_strategy": {
                "wholesale_markup": "30%",
                "retail_markup": "85%",
                "competitive_positioning": "Premium",
                "target_margin": "45%"
            },
            "margin_analysis": {
                "gross_margin": 45.5,
                "operating_margin": 35.2,
                "net_margin": 28.8,
                "break_even_point": 542
            }
        },
        "medium_scale": {
            "batch_size": 10000,
            "total_customers": 10000,
            "costing_breakdown": {
                "capex": 1200000 * multiplier["capex"],
                "opex": 800000 * multiplier["opex"],
                "total_cost": (1200000 + 800000) * multiplier["capex"],
                "cost_per_unit": 200 * multiplier["opex"],
                "retail_price": 450 * multiplier["pricing"],
                "wholesale_price": 320 * multiplier["pricing"],
                "profit_margin": 55.6,
                "revenue_potential": 4500000 * multiplier["pricing"],
                "break_even_customers": 4444
            },
            "capex_details": {
                "equipment": 400000 * multiplier["capex"],
                "machinery": 350000 * multiplier["capex"],
                "facility_setup": 250000 * multiplier["capex"],
                "quality_control": 200000 * multiplier["capex"]
            },
            "opex_details": {
                "raw_materials": 400000 * multiplier["opex"],
                "labor": 150000 * multiplier["opex"],
                "utilities": 80000 * multiplier["opex"],
                "packaging": 100000 * multiplier["opex"],
                "quality_assurance": 70000 * multiplier["opex"]
            },
            "pricing_strategy": {
                "wholesale_markup": "60%",
                "retail_markup": "125%",
                "competitive_positioning": "Mid-Premium",
                "target_margin": "55%"
            },
            "margin_analysis": {
                "gross_margin": 55.6,
                "operating_margin": 45.3,
                "net_margin": 38.9,
                "break_even_point": 4444
            }
        },
        "large_scale": {
            "batch_size": 50000,
            "total_customers": 50000,
            "costing_breakdown": {
                "capex": 2500000 * multiplier["capex"],
                "opex": 3000000 * multiplier["opex"],
                "total_cost": (2500000 + 3000000) * multiplier["capex"],
                "cost_per_unit": 110 * multiplier["opex"],
                "retail_price": 280 * multiplier["pricing"],
                "wholesale_price": 200 * multiplier["pricing"],
                "profit_margin": 60.7,
                "revenue_potential": 14000000 * multiplier["pricing"],
                "break_even_customers": 19643
            },
            "capex_details": {
                "equipment": 800000 * multiplier["capex"],
                "machinery": 700000 * multiplier["capex"],
                "facility_setup": 500000 * multiplier["capex"],
                "quality_control": 500000 * multiplier["capex"]
            },
            "opex_details": {
                "raw_materials": 1500000 * multiplier["opex"],
                "labor": 500000 * multiplier["opex"],
                "utilities": 300000 * multiplier["opex"],
                "packaging": 400000 * multiplier["opex"],
                "quality_assurance": 300000 * multiplier["opex"]
            },
            "pricing_strategy": {
                "wholesale_markup": "82%",
                "retail_markup": "155%",
                "competitive_positioning": "Mass Premium",
                "target_margin": "60%"
            },
            "margin_analysis": {
                "gross_margin": 60.7,
                "operating_margin": 52.4,
                "net_margin": 45.1,
                "break_even_point": 19643
            }
        },
        "scaling_benefits": [
            "Economies of scale reduce per-unit costs by 40-70%",
            "Bulk purchasing power for raw materials and packaging",
            "Automated manufacturing processes become viable",
            "Distribution networks become more efficient",
            "Marketing costs spread across larger customer base"
        ],
        "risk_factors": [
            "Higher upfront investment required for scaling",
            "Increased inventory management complexity",
            "Need for larger storage and distribution facilities",
            "Market demand uncertainty at larger scales",
            "Competition intensifies with scale"
        ],
        "market_opportunity": f"Manufacturing {formulation.product_name} presents a scalable opportunity with potential revenue of ₹14,000,000 at full scale, requiring strategic scaling decisions based on market demand and capital availability."
    }

def calculate_manufacturing_scenarios(formulation: GenerateResponse) -> ManufacturingInsights:
    """
    Calculate manufacturing scenarios using OpenAI-generated costing data.
    """
    # Determine category from formulation
    category = "cosmetics"  # Default
    if "pet" in formulation.product_name.lower() or "pet" in formulation.reasoning.lower():
        category = "pet food"
    elif "wellness" in formulation.product_name.lower() or "supplement" in formulation.reasoning.lower():
        category = "wellness"
    
    # Fetch costing data from OpenAI
    costing_data = fetch_costing_from_openai(formulation, category)
    
    # Convert to ManufacturingInsights structure
    def create_manufacturing_scenario(scale_data: dict, scale_name: str) -> ManufacturingScenario:
        costing_breakdown = CostingBreakdown(**scale_data["costing_breakdown"])
        
        # Map scale names to appropriate customer_scale strings
        scale_mapping = {
            "small_scale": "1000",
            "medium_scale": "10k", 
            "large_scale": "10k_plus"
        }
        
        return ManufacturingScenario(
            customer_scale=scale_mapping[scale_name],
            batch_size=scale_data["batch_size"],
            total_customers=scale_data["total_customers"],
            costing_breakdown=costing_breakdown,
            capex_details=scale_data["capex_details"],
            opex_details=scale_data["opex_details"],
            pricing_strategy=scale_data["pricing_strategy"],
            margin_analysis=scale_data["margin_analysis"]
        )
    
    return ManufacturingInsights(
        small_scale=create_manufacturing_scenario(costing_data["small_scale"], "small"),
        medium_scale=create_manufacturing_scenario(costing_data["medium_scale"], "medium"),
        large_scale=create_manufacturing_scenario(costing_data["large_scale"], "large"),
        scaling_benefits=costing_data["scaling_benefits"],
        risk_factors=costing_data["risk_factors"],
        market_opportunity=costing_data["market_opportunity"]
    )

def analyze_manufacturing(request: ManufacturingRequest) -> ManufacturingInsights:
    """
    Analyze manufacturing scenarios for different customer scales.
    """
    print("🔍 Analyzing manufacturing scenarios...")
    
    # Validate and complete formulation data
    formulation = request.formulation
    
    # Ensure ingredients have required fields
    if not hasattr(formulation, 'ingredients') or not formulation.ingredients:
        print("⚠️ No ingredients found, using fallback data")
        formulation.ingredients = [
            {
                "name": "Water",
                "percent": 80.0,
                "cost_per_100ml": 0.5,
                "why_chosen": "Base solvent for the formulation",
                "suppliers": [
                    {
                        "name": "Local Water Supplier",
                        "contact": "+91-1234567890",
                        "location": "Mumbai, Maharashtra",
                        "price_per_unit": 0.5,
                        "price_per_100ml": 0.5
                    }
                ]
            }
        ]
    
    # Ensure other required fields exist
    if not hasattr(formulation, 'product_name') or not formulation.product_name:
        formulation.product_name = "Sample Product"
    
    if not hasattr(formulation, 'reasoning') or not formulation.reasoning:
        formulation.reasoning = "Sample formulation reasoning"
    
    if not hasattr(formulation, 'manufacturing_steps') or not formulation.manufacturing_steps:
        formulation.manufacturing_steps = ["Step 1: Prepare equipment", "Step 2: Mix ingredients"]
    
    if not hasattr(formulation, 'estimated_cost') or not formulation.estimated_cost:
        formulation.estimated_cost = 15.0
    
    if not hasattr(formulation, 'safety_notes') or not formulation.safety_notes:
        formulation.safety_notes = ["Sample safety note"]
    
    print(f"📊 Analyzing formulation: {formulation.product_name}")
    print(f"📦 Ingredients count: {len(formulation.ingredients)}")
    
    # Determine category from product name or use default
    category = "cosmetics"  # Default category
    if hasattr(formulation, 'category') and formulation.category:
        category = formulation.category
    elif "food" in formulation.product_name.lower() or "pet" in formulation.product_name.lower():
        category = "pet food"
    elif "wellness" in formulation.product_name.lower() or "health" in formulation.product_name.lower():
        category = "wellness"
    
    print(f"🏷️ Category: {category}")
    
    # Fetch costing data
    costing_data = fetch_costing_from_openai(formulation, category)
    
    # Convert to ManufacturingInsights structure
    def create_manufacturing_scenario(scale_data: dict, scale_name: str) -> ManufacturingScenario:
        costing_breakdown = CostingBreakdown(**scale_data["costing_breakdown"])
        
        # Map scale names to appropriate customer_scale strings
        scale_mapping = {
            "small_scale": "1000",
            "medium_scale": "10k", 
            "large_scale": "10k_plus"
        }
        
        return ManufacturingScenario(
            customer_scale=scale_mapping[scale_name],
            batch_size=scale_data["batch_size"],
            total_customers=scale_data["total_customers"],
            costing_breakdown=costing_breakdown,
            capex_details=scale_data["capex_details"],
            opex_details=scale_data["opex_details"],
            pricing_strategy=scale_data["pricing_strategy"],
            margin_analysis=scale_data["margin_analysis"]
        )
    
    return ManufacturingInsights(
        small_scale=create_manufacturing_scenario(costing_data["small_scale"], "small_scale"),
        medium_scale=create_manufacturing_scenario(costing_data["medium_scale"], "medium_scale"),
        large_scale=create_manufacturing_scenario(costing_data["large_scale"], "large_scale"),
        scaling_benefits=costing_data["scaling_benefits"],
        risk_factors=costing_data["risk_factors"],
        market_opportunity=costing_data["market_opportunity"]
    )
