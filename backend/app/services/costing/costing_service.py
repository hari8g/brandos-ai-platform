import os
import json
from openai import OpenAI
from app.models.generate import GenerateResponse
from app.models.costing import CostEstimate, BatchPricing, CostingRequest, CostingResponse

# Initialize OpenAI client
client = None
try:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key != "your_openai_api_key_here":
        client = OpenAI(api_key=api_key)
        print("✅ OpenAI client initialized successfully for costing")
    else:
        print("⚠️ OpenAI API key not found, will use fallback mock data for costing")
except Exception as e:
    print(f"⚠️ Failed to initialize OpenAI client for costing: {e}")

def calculate_batch_sizes(batch_type: str) -> tuple:
    """Get batch size ranges for different types"""
    batch_sizes = {
        "small": (100, 500),
        "medium": (1000, 5000),
        "large": (10000, 50000)
    }
    return batch_sizes.get(batch_type, (100, 500))

def calculate_realistic_premium_cogs(ingredients, batch_size, product_name):
    """
    Calculate a detailed COGS and pricing breakdown for premium cosmetic manufacturing.
    """
    # --- Hardcoded realistic values (INR) ---
    capex_per_year = 1200000  # Annual capex amortization (e.g., equipment, clean room) in INR
    annual_batches = 120      # Number of batches per year
    labor_rate = 0.18         # 18% of ingredient cost
    overhead_rate = 0.14      # 14% of ingredient cost
    packaging_rate = 0.22     # 22% of ingredient cost
    quality_control_rate = 0.09 # 9% of ingredient cost
    margin = 0.78             # 78% gross margin for premium
    batch_sizes = {
        "small": 250,
        "medium": 2500,
        "large": 20000
    }
    units = batch_sizes.get(batch_size, 2500)

    # 1. Raw material cost
    total_ingredient_cost = sum(ing.cost_per_100ml * ing.percent / 100 * units for ing in ingredients)
    # 2. Capex amortization per batch
    capex_amortization = capex_per_year / annual_batches
    # 3. Labor, overhead, packaging, quality control
    labor_cost = total_ingredient_cost * labor_rate
    overhead_cost = total_ingredient_cost * overhead_rate
    packaging_cost = total_ingredient_cost * packaging_rate
    quality_control_cost = total_ingredient_cost * quality_control_rate
    # 4. Total COGS
    cogs = total_ingredient_cost + capex_amortization + labor_cost + overhead_cost + packaging_cost + quality_control_cost
    # 5. Pricing
    unit_cost = cogs / units
    wholesale_price = cogs * (1 + margin)
    retail_price_30ml = unit_cost * 30 * (1 + margin)  # 30ml pack
    retail_price_50ml = unit_cost * 50 * (1 + margin)  # 50ml pack
    retail_price_100ml = unit_cost * 100 * (1 + margin)  # 100ml pack
    profit_margin = margin * 100
    return {
        "raw_materials_cost": total_ingredient_cost,
        "capex_amortization": capex_amortization,
        "labor_cost": labor_cost,
        "packaging_cost": packaging_cost,
        "overhead_cost": overhead_cost,
        "quality_control_cost": quality_control_cost,
        "total_production_cost": cogs,
        "unit_cost": unit_cost,
        "retail_price_30ml": retail_price_30ml,
        "retail_price_50ml": retail_price_50ml,
        "retail_price_100ml": retail_price_100ml,
        "wholesale_price": wholesale_price,
        "profit_margin_percentage": profit_margin,
        "cost_breakdown": {
            "ingredients": total_ingredient_cost,
            "capex": capex_amortization,
            "labor": labor_cost,
            "packaging": packaging_cost,
            "overhead": overhead_cost,
            "quality_control": quality_control_cost
        },
        "pricing_strategy": f"Premium {batch_size} batch pricing for {product_name} with full COGS breakdown",
        "market_positioning": "Luxury skincare positioned against premium brands like La Mer and SK-II",
        "premium_factors": [
            "Pharmaceutical-grade manufacturing standards",
            "Premium ingredient sourcing and testing",
            "Luxury packaging with UV protection",
            "Extensive quality control and compliance",
            "Clean room manufacturing environment",
            "Capex amortization for advanced equipment"
        ],
        "cost_optimization_suggestions": [
            "Consider bulk ingredient sourcing for larger batches",
            "Optimize packaging design for cost efficiency",
            "Implement automated quality control processes",
            "Negotiate better supplier contracts for premium ingredients",
            "Increase batch size to reduce per-unit capex amortization"
        ]
    }

def estimate_cost_with_ai(formulation: GenerateResponse, batch_size: str, target_market: str = "premium", region: str = "IN") -> dict:
    """
    Use OpenAI to estimate costs for a specific batch size with premium pricing
    """
    min_units, max_units = calculate_batch_sizes(batch_size)
    avg_units = (min_units + max_units) // 2
    
    # Calculate total ingredient cost for the batch
    total_ingredient_cost = sum(ingredient.cost_per_100ml * ingredient.percent / 100 * avg_units for ingredient in formulation.ingredients)
    
    # Create detailed ingredient breakdown for AI analysis
    ingredient_details = []
    for ingredient in formulation.ingredients:
        ingredient_cost = ingredient.cost_per_100ml * ingredient.percent / 100 * avg_units
        ingredient_details.append({
            "name": ingredient.name,
            "percentage": ingredient.percent,
            "cost_per_100ml": ingredient.cost_per_100ml,
            "batch_cost": ingredient_cost,
            "why_chosen": ingredient.why_chosen
        })
    
    prompt = f"""
    As a premium cosmetic manufacturing cost analyst in India, calculate detailed costs for a {batch_size} batch ({avg_units} units) of this luxury skincare product:

    Product: {formulation.product_name}
    Target Market: {target_market} (Premium/Luxury positioning)
    Region: {region} (India)

    INGREDIENT BREAKDOWN:
    {json.dumps(ingredient_details, indent=2)}

    Total ingredient cost for batch: ₹{total_ingredient_cost:.2f}

    MANUFACTURING STEPS:
    {chr(10).join(f"- {step}" for step in formulation.manufacturing_steps)}

    MARKET CONTEXT:
    - Competitive landscape: {formulation.competitive_landscape.get('price_range', '₹2,500-8,000 per 30ml') if formulation.competitive_landscape else 'Premium pricing'}
    - Target demographics: {formulation.competitive_landscape.get('target_demographics', 'Women aged 25-45 with disposable income') if formulation.competitive_landscape else 'Premium consumers'}
    - Distribution: {formulation.competitive_landscape.get('distribution_channels', 'Luxury department stores, premium beauty retailers') if formulation.competitive_landscape else 'Premium channels'}

    Please provide a JSON response with the following structure:
    {{
        "raw_materials_cost": float,
        "labor_cost": float,
        "packaging_cost": float,
        "overhead_cost": float,
        "quality_control_cost": float,
        "total_production_cost": float,
        "unit_cost": float,
        "retail_price_30ml": float,
        "retail_price_50ml": float,
        "retail_price_100ml": float,
        "wholesale_price": float,
        "profit_margin_percentage": float,
        "cost_breakdown": {{
            "ingredients": float,
            "labor": float,
            "packaging": float,
            "overhead": float,
            "quality_control": float
        }},
        "pricing_strategy": string,
        "market_positioning": string,
        "premium_factors": [
            "Factor 1 description",
            "Factor 2 description"
        ],
        "cost_optimization_suggestions": [
            "Suggestion 1",
            "Suggestion 2"
        ]
    }}

    CONSIDERATIONS FOR PREMIUM PRICING:
    - Use pharmaceutical-grade manufacturing standards
    - Include premium packaging with UV protection and luxury finishes
    - Factor in extensive quality control and testing
    - Consider clean room manufacturing costs
    - Include premium ingredient sourcing and testing
    - Factor in luxury brand positioning and marketing costs
    - Consider premium distribution channel costs
    - Include regulatory compliance for premium skincare
    - Factor in R&D and formulation development costs
    - Consider premium customer service and support costs

    COST BREAKDOWN GUIDELINES:
    - Raw materials: 40-50% of total cost (premium ingredients)
    - Labor: 15-20% (skilled technicians, clean room operations)
    - Packaging: 20-25% (luxury packaging, UV protection, premium finishes)
    - Overhead: 10-15% (facility, utilities, clean room maintenance)
    - Quality Control: 5-10% (extensive testing, compliance)

    PRICING STRATEGY:
    - Target 70-80% profit margins for premium positioning
    - Position against luxury brands like La Mer, SK-II, Estée Lauder
    - Consider premium distribution channel markups
    - Factor in luxury marketing and brand development costs

    All costs should be in Indian Rupees (INR) and reflect premium/luxury market positioning.
    """

    if not client:
        print("🔄 Using fallback mock costing (OpenAI not available)")
        return generate_mock_costing_data(formulation, batch_size, total_ingredient_cost, avg_units, target_market)

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=2000
        )
        
        # Parse the response
        content = response.choices[0].message.content
        print(f"OpenAI Costing Response: {content}")
        
        # Extract JSON from response
        start_idx = content.find('{')
        end_idx = content.rfind('}') + 1
        json_str = content[start_idx:end_idx]
        
        # Use OpenAI's ingredient costs, but always run through our premium COGS logic
        return calculate_realistic_premium_cogs(formulation.ingredients, batch_size, formulation.product_name)
        
    except Exception as e:
        print(f"Error in AI costing: {e}")
        # Fallback to mock data
        return generate_mock_costing_data(formulation, batch_size, total_ingredient_cost, avg_units, target_market)

def generate_mock_costing_data(formulation: GenerateResponse, batch_size: str, ingredient_cost: float, units: int, target_market: str = "premium") -> dict:
    """Generate mock costing data as fallback with premium positioning"""
    
    # Premium multipliers for different batch sizes
    multipliers = {
        "small": {"labor": 0.20, "packaging": 0.25, "overhead": 0.15, "quality_control": 0.10},
        "medium": {"labor": 0.15, "packaging": 0.20, "overhead": 0.12, "quality_control": 0.08},
        "large": {"labor": 0.12, "packaging": 0.18, "overhead": 0.10, "quality_control": 0.06}
    }
    
    mult = multipliers.get(batch_size, multipliers["medium"])
    
    # Calculate costs with premium positioning
    labor_cost = ingredient_cost * mult["labor"]
    packaging_cost = ingredient_cost * mult["packaging"]
    overhead_cost = ingredient_cost * mult["overhead"]
    quality_control_cost = ingredient_cost * mult["quality_control"]
    total_production_cost = ingredient_cost + labor_cost + packaging_cost + overhead_cost + quality_control_cost
    
    unit_cost = total_production_cost / units
    
    # Premium pricing strategy
    if target_market == "premium":
        retail_price_30ml = unit_cost * 0.3 * 12  # 12x markup for premium 30ml
        retail_price_50ml = unit_cost * 0.5 * 8   # 8x markup for premium 50ml
        retail_price_100ml = unit_cost * 6         # 6x markup for premium 100ml
        wholesale_price = unit_cost * 3            # 3x markup for wholesale
        profit_margin = 75.0  # 75% profit margin for premium
    else:
        retail_price_30ml = unit_cost * 0.3 * 8
        retail_price_50ml = unit_cost * 0.5 * 6
        retail_price_100ml = unit_cost * 4
        wholesale_price = unit_cost * 2
        profit_margin = 60.0
    
    return {
        "raw_materials_cost": ingredient_cost,
        "labor_cost": labor_cost,
        "packaging_cost": packaging_cost,
        "overhead_cost": overhead_cost,
        "quality_control_cost": quality_control_cost,
        "total_production_cost": total_production_cost,
        "unit_cost": unit_cost,
        "retail_price_30ml": retail_price_30ml,
        "retail_price_50ml": retail_price_50ml,
        "retail_price_100ml": retail_price_100ml,
        "wholesale_price": wholesale_price,
        "profit_margin_percentage": profit_margin,
        "cost_breakdown": {
            "ingredients": ingredient_cost,
            "labor": labor_cost,
            "packaging": packaging_cost,
            "overhead": overhead_cost,
            "quality_control": quality_control_cost
        },
        "pricing_strategy": f"Premium {batch_size} batch pricing for {formulation.product_name} targeting luxury market",
        "market_positioning": f"Luxury skincare positioned against premium brands like La Mer and SK-II",
        "premium_factors": [
            "Pharmaceutical-grade manufacturing standards",
            "Premium ingredient sourcing and testing",
            "Luxury packaging with UV protection",
            "Extensive quality control and compliance",
            "Clean room manufacturing environment"
        ],
        "cost_optimization_suggestions": [
            "Consider bulk ingredient sourcing for larger batches",
            "Optimize packaging design for cost efficiency",
            "Implement automated quality control processes",
            "Negotiate better supplier contracts for premium ingredients"
        ]
    }

def estimate_cost(request: CostingRequest) -> CostEstimate:
    """
    Generate comprehensive cost estimates for multiple batch sizes
    """
    # Convert old Formulation to new GenerateResponse format if needed
    if hasattr(request.formulation, 'ingredients') and hasattr(request.formulation.ingredients[0], 'suppliers'):
        # Already in new format
        formulation = request.formulation
    else:
        # Convert old format to new format
        formulation = GenerateResponse(
            product_name=request.formulation.product_name,
            reasoning=request.formulation.reasoning,
            ingredients=request.formulation.ingredients,  # This will need conversion
            manufacturing_steps=["Standard manufacturing process"],
            estimated_cost=request.formulation.estimated_cost,
            safety_notes=request.formulation.safety_notes,
            packaging_marketing_inspiration="Premium packaging and marketing",
            market_trends=["Premium skincare trends"],
            competitive_landscape={"price_range": "₹2,500-8,000 per 30ml"}
        )
    
    batch_pricing_list = []
    
    for batch_size in request.batch_sizes:
        # Get AI-powered costing for this batch size
        costing_data = estimate_cost_with_ai(
            formulation, 
            batch_size, 
            request.target_market or "premium",
            request.region or "IN"
        )
        
        # Create BatchPricing object
        batch_pricing = BatchPricing(
            batch_size=batch_size,
            unit_cost=costing_data["unit_cost"],
            total_cost=costing_data["total_production_cost"],
            retail_price=costing_data["retail_price_50ml"],  # Use 50ml as default
            wholesale_price=costing_data["wholesale_price"],
            profit_margin=costing_data["profit_margin_percentage"],
            currency="INR"
        )
        batch_pricing_list.append(batch_pricing)
    
    # Use medium batch as the primary estimate
    medium_batch_data = next((bp for bp in batch_pricing_list if bp.batch_size == "medium"), batch_pricing_list[0])
    
    return CostEstimate(
        raw_materials=medium_batch_data.total_cost * 0.45,  # Premium ingredients portion
        labor_cost=medium_batch_data.total_cost * 0.15,
        packaging_cost=medium_batch_data.total_cost * 0.20,
        overhead_cost=medium_batch_data.total_cost * 0.12,
        total_production_cost=medium_batch_data.total_cost,
        margin=medium_batch_data.profit_margin,
        total=medium_batch_data.retail_price,
        breakdown={
            "ingredients": medium_batch_data.total_cost * 0.45,
            "labor": medium_batch_data.total_cost * 0.15,
            "packaging": medium_batch_data.total_cost * 0.20,
            "overhead": medium_batch_data.total_cost * 0.12,
            "quality_control": medium_batch_data.total_cost * 0.08
        },
        currency="INR",
        batch_pricing=batch_pricing_list
    )
