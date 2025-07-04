from app.models.generate import GenerateResponse
from app.models.costing import CostEstimate, BatchPricing, CostingRequest, CostingResponse

def calculate_batch_sizes(batch_type: str) -> tuple:
    """Get batch size ranges for different types"""
    batch_sizes = {
        "small": (100, 500),
        "medium": (1000, 5000),
        "large": (10000, 50000)
    }
    return batch_sizes.get(batch_type, (100, 500))

def calculate_scale_factors(batch_size: str, units: int) -> dict:
    """
    Calculate scale-appropriate factors for different operation sizes.
    Supports small-scale vendors and first-time entrepreneurs.
    """
    # Base equipment costs for different scales (INR)
    base_equipment_costs = {
        "small": 50000,    # Basic equipment for small batches
        "medium": 200000,  # Standard equipment for medium batches
        "large": 800000    # Advanced equipment for large batches
    }
    
    # Annual batch capacity based on scale
    annual_batch_capacity = {
        "small": 24,    # 2 batches per month
        "medium": 60,   # 5 batches per month
        "large": 120    # 10 batches per month
    }
    
    # Labor efficiency improves with scale
    labor_efficiency = {
        "small": 0.30,   # 30% of ingredient cost (manual processes)
        "medium": 0.20,  # 20% of ingredient cost (semi-automated)
        "large": 0.15    # 15% of ingredient cost (automated)
    }
    
    # Overhead rates scale with operation size
    overhead_rates = {
        "small": 0.25,   # 25% (higher due to small scale inefficiencies)
        "medium": 0.15,  # 15% (standard overhead)
        "large": 0.10    # 10% (economies of scale)
    }
    
    # Packaging costs scale with volume
    packaging_rates = {
        "small": 0.35,   # 35% (higher due to small order quantities)
        "medium": 0.25,  # 25% (standard packaging costs)
        "large": 0.20    # 20% (bulk packaging discounts)
    }
    
    # Quality control costs
    quality_control_rates = {
        "small": 0.15,   # 15% (manual QC processes)
        "medium": 0.10,  # 10% (standard QC)
        "large": 0.08    # 8% (automated QC)
    }
    
    # Determine scale based on batch size and units
    if isinstance(batch_size, str):
        scale = batch_size
    else:
        # Custom batch size - determine scale based on units
        if units <= 500:
            scale = "small"
        elif units <= 5000:
            scale = "medium"
        else:
            scale = "large"
    
    # Calculate capex amortization
    equipment_cost = base_equipment_costs[scale]
    annual_batches = annual_batch_capacity[scale]
    capex_per_batch = equipment_cost / annual_batches
    
    return {
        "scale": scale,
        "capex_per_batch": capex_per_batch,
        "labor_rate": labor_efficiency[scale],
        "overhead_rate": overhead_rates[scale],
        "packaging_rate": packaging_rates[scale],
        "quality_control_rate": quality_control_rates[scale],
        "annual_batches": annual_batches,
        "equipment_cost": equipment_cost
    }

def calculate_realistic_premium_cogs(ingredients, batch_size, product_name, custom_units=None):
    """
    Calculate a detailed COGS and pricing breakdown for cosmetic manufacturing.
    Supports small-scale vendors and first-time entrepreneurs with scalable costs.
    Exclude water and replace with Aloe Vera Juice if present.
    Support custom batch sizes.
    """
    # Support custom batch size
    units = custom_units if custom_units else {
        "small": 250,
        "medium": 2500,
        "large": 20000
    }.get(batch_size, 2500)
    
    # Calculate scale-appropriate factors
    scale_factors = calculate_scale_factors(batch_size, units)
    
    # Margin varies by scale (smaller operations need higher margins)
    margins = {
        "small": 0.70,   # 70% margin for small scale
        "medium": 0.75,  # 75% margin for medium scale
        "large": 0.80    # 80% margin for large scale
    }
    margin = margins[scale_factors["scale"]]

    # 1. Raw material cost (exclude water, replace with Aloe Vera Juice if present)
    filtered_ingredients = []
    replaced_water = False
    for ing in ingredients:
        if ing.name.strip().lower() in ["water", "purified water", "aqua"]:
            # Replace with Aloe Vera Juice (10 INR/100ml)
            filtered_ingredients.append(type(ing)(
                name="Aloe Vera Juice",
                percent=ing.percent,
                cost_per_100ml=10.0,
                why_chosen="Premium base for hydration and skin soothing",
                suppliers=getattr(ing, 'suppliers', [])
            ))
            replaced_water = True
        else:
            filtered_ingredients.append(ing)
    
    # 2. Calculate costs using scale-appropriate factors
    total_ingredient_cost = sum(ing.cost_per_100ml * ing.percent / 100 * units for ing in filtered_ingredients)
    capex_amortization = scale_factors["capex_per_batch"]
    labor_cost = total_ingredient_cost * scale_factors["labor_rate"]
    overhead_cost = total_ingredient_cost * scale_factors["overhead_rate"]
    packaging_cost = total_ingredient_cost * scale_factors["packaging_rate"]
    quality_control_cost = total_ingredient_cost * scale_factors["quality_control_rate"]
    
    cogs = total_ingredient_cost + capex_amortization + labor_cost + overhead_cost + packaging_cost + quality_control_cost
    unit_cost = cogs / units
    wholesale_price = cogs * (1 + margin)
    retail_price_30ml = unit_cost * 30 * (1 + margin)
    retail_price_50ml = unit_cost * 50 * (1 + margin)
    retail_price_100ml = unit_cost * 100 * (1 + margin)
    profit_margin = margin * 100
    
    # Scale-appropriate messaging
    scale_messages = {
        "small": {
            "pricing_strategy": f"Small-scale {batch_size} batch pricing for {product_name} - suitable for first-time entrepreneurs",
            "market_positioning": "Artisanal skincare positioned for niche markets and direct-to-consumer sales",
            "premium_factors": [
                "Handcrafted in small batches for quality control",
                "Artisanal manufacturing with personal attention",
                "Premium ingredient sourcing for small-scale production",
                "Direct-to-consumer pricing model",
                "Flexible production for custom formulations"
            ],
            "cost_optimization_suggestions": [
                "Start with small batches to validate market demand",
                "Use local suppliers to reduce shipping costs",
                "Consider co-manufacturing for larger orders",
                "Optimize packaging for small batch quantities",
                "Focus on direct-to-consumer sales to reduce distribution costs"
            ]
        },
        "medium": {
            "pricing_strategy": f"Medium-scale {batch_size} batch pricing for {product_name} - growing business model",
            "market_positioning": "Premium skincare positioned for boutique retailers and online platforms",
            "premium_factors": [
                "Semi-automated manufacturing for consistency",
                "Premium ingredient sourcing and testing",
                "Quality packaging suitable for retail",
                "Standardized quality control processes",
                "Scalable production capacity"
            ],
            "cost_optimization_suggestions": [
                "Negotiate bulk ingredient pricing for medium batches",
                "Invest in semi-automated equipment for efficiency",
                "Establish relationships with reliable suppliers",
                "Optimize packaging for retail distribution",
                "Consider contract manufacturing for peak demand"
            ]
        },
        "large": {
            "pricing_strategy": f"Large-scale {batch_size} batch pricing for {product_name} - established business model",
            "market_positioning": "Luxury skincare positioned against premium brands like La Mer and SK-II",
            "premium_factors": [
                "Pharmaceutical-grade manufacturing standards",
                "Premium ingredient sourcing and testing",
                "Luxury packaging with UV protection",
                "Extensive quality control and compliance",
                "Clean room manufacturing environment",
                "Automated production for consistency"
            ],
            "cost_optimization_suggestions": [
                "Leverage economies of scale for ingredient sourcing",
                "Invest in automated quality control processes",
                "Negotiate premium supplier contracts",
                "Optimize packaging design for cost efficiency",
                "Consider vertical integration for key ingredients"
            ]
        }
    }
    
    scale_info = scale_messages[scale_factors["scale"]]
    
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
        "scale_info": {
            "scale": scale_factors["scale"],
            "equipment_cost": scale_factors["equipment_cost"],
            "annual_batches": scale_factors["annual_batches"],
            "capex_per_batch": capex_amortization
        },
        "pricing_strategy": scale_info["pricing_strategy"],
        "market_positioning": scale_info["market_positioning"],
        "premium_factors": scale_info["premium_factors"],
        "cost_optimization_suggestions": scale_info["cost_optimization_suggestions"]
    }

def estimate_cost_with_ai(formulation: GenerateResponse, batch_size: str, target_market: str = "premium", region: str = "IN") -> dict:
    """
    Use OpenAI to estimate costs for a specific batch size with scalable pricing
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
    
    # Determine scale for AI prompt
    scale_factors = calculate_scale_factors(batch_size, avg_units)
    
    # Margin varies by scale (smaller operations need higher margins)
    margins = {
        "small": 0.70,   # 70% margin for small scale
        "medium": 0.75,  # 75% margin for medium scale
        "large": 0.80    # 80% margin for large scale
    }
    
    prompt = f"""
    As a cosmetic manufacturing cost analyst in India, calculate detailed costs for a {batch_size} batch ({avg_units} units) of this skincare product:

    Product: {formulation.product_name}
    Target Market: {target_market}
    Region: {region} (India)
    Scale: {scale_factors["scale"]} (equipment cost: ₹{scale_factors["equipment_cost"]:,}, annual batches: {scale_factors["annual_batches"]})

    INGREDIENT BREAKDOWN:
    {ingredient_details}

    Total ingredient cost for batch: ₹{total_ingredient_cost:.2f}

    MANUFACTURING STEPS:
    {chr(10).join(f"- {step}" for step in formulation.manufacturing_steps)}

    MARKET CONTEXT:
    - Competitive landscape: {formulation.competitive_landscape.get('price_range', '₹500-2000 per 50ml') if formulation.competitive_landscape else 'Market-appropriate pricing'}
    - Target demographics: {formulation.competitive_landscape.get('target_demographics', 'General consumers') if formulation.competitive_landscape else 'General consumers'}
    - Distribution: {formulation.competitive_landscape.get('distribution_channels', 'Online, retail stores') if formulation.competitive_landscape else 'Online, retail stores'}

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
        "scale_factors": [
            "Factor 1 description",
            "Factor 2 description"
        ],
        "cost_optimization_suggestions": [
            "Suggestion 1",
            "Suggestion 2"
        ]
    }}

    CONSIDERATIONS FOR {scale_factors["scale"].upper()} SCALE:
    - Equipment costs: ₹{scale_factors["equipment_cost"]:,} amortized over {scale_factors["annual_batches"]} batches/year
    - Labor efficiency: {scale_factors["labor_rate"]*100:.0f}% of ingredient cost
    - Overhead: {scale_factors["overhead_rate"]*100:.0f}% of ingredient cost
    - Packaging: {scale_factors["packaging_rate"]*100:.0f}% of ingredient cost
    - Quality control: {scale_factors["quality_control_rate"]*100:.0f}% of ingredient cost

    COST BREAKDOWN GUIDELINES:
    - Raw materials: 40-60% of total cost
    - Labor: {scale_factors["labor_rate"]*100:.0f}% (varies by scale)
    - Packaging: {scale_factors["packaging_rate"]*100:.0f}% (varies by scale)
    - Overhead: {scale_factors["overhead_rate"]*100:.0f}% (varies by scale)
    - Quality Control: {scale_factors["quality_control_rate"]*100:.0f}% (varies by scale)

    PRICING STRATEGY:
    - Target {margins[scale_factors["scale"]]*100:.0f}% profit margins for {scale_factors["scale"]} scale
    - Consider scale-appropriate market positioning
    - Factor in distribution channel costs for the scale

    All costs should be in Indian Rupees (INR) and reflect {scale_factors["scale"]} scale operations.
    """

    # Fallback to mock data
    return generate_mock_costing_data(formulation, batch_size, total_ingredient_cost, avg_units, target_market)

def generate_mock_costing_data(formulation: GenerateResponse, batch_size: str, ingredient_cost: float, units: int, target_market: str = "premium") -> dict:
    """Generate mock costing data as fallback with scalable positioning"""
    
    # Get scale-appropriate factors
    scale_factors = calculate_scale_factors(batch_size, units)
    
    # Calculate costs using scale-appropriate factors
    labor_cost = ingredient_cost * scale_factors["labor_rate"]
    packaging_cost = ingredient_cost * scale_factors["packaging_rate"]
    overhead_cost = ingredient_cost * scale_factors["overhead_rate"]
    quality_control_cost = ingredient_cost * scale_factors["quality_control_rate"]
    capex_amortization = scale_factors["capex_per_batch"]
    
    total_production_cost = ingredient_cost + capex_amortization + labor_cost + packaging_cost + overhead_cost + quality_control_cost
    unit_cost = total_production_cost / units
    
    # Scale-appropriate pricing
    margins = {
        "small": 0.70,
        "medium": 0.75,
        "large": 0.80
    }
    margin = margins[scale_factors["scale"]]
    
    retail_price_30ml = unit_cost * 0.3 * (1 + margin)
    retail_price_50ml = unit_cost * 0.5 * (1 + margin)
    retail_price_100ml = unit_cost * (1 + margin)
    wholesale_price = unit_cost * (1 + margin * 0.5)  # Lower margin for wholesale
    profit_margin = margin * 100
    
    # Scale-appropriate messaging
    scale_messages = {
        "small": {
            "pricing_strategy": f"Small-scale {batch_size} batch pricing for {formulation.product_name} - suitable for first-time entrepreneurs",
            "market_positioning": "Artisanal skincare positioned for niche markets and direct-to-consumer sales",
            "premium_factors": [
                "Handcrafted in small batches for quality control",
                "Artisanal manufacturing with personal attention",
                "Premium ingredient sourcing for small-scale production",
                "Direct-to-consumer pricing model",
                "Flexible production for custom formulations"
            ],
            "cost_optimization_suggestions": [
                "Start with small batches to validate market demand",
                "Use local suppliers to reduce shipping costs",
                "Consider co-manufacturing for larger orders",
                "Optimize packaging for small batch quantities",
                "Focus on direct-to-consumer sales to reduce distribution costs"
            ]
        },
        "medium": {
            "pricing_strategy": f"Medium-scale {batch_size} batch pricing for {formulation.product_name} - growing business model",
            "market_positioning": "Premium skincare positioned for boutique retailers and online platforms",
            "premium_factors": [
                "Semi-automated manufacturing for consistency",
                "Premium ingredient sourcing and testing",
                "Quality packaging suitable for retail",
                "Standardized quality control processes",
                "Scalable production capacity"
            ],
            "cost_optimization_suggestions": [
                "Negotiate bulk ingredient pricing for medium batches",
                "Invest in semi-automated equipment for efficiency",
                "Establish relationships with reliable suppliers",
                "Optimize packaging for retail distribution",
                "Consider contract manufacturing for peak demand"
            ]
        },
        "large": {
            "pricing_strategy": f"Large-scale {batch_size} batch pricing for {formulation.product_name} - established business model",
            "market_positioning": "Luxury skincare positioned against premium brands like La Mer and SK-II",
            "premium_factors": [
                "Pharmaceutical-grade manufacturing standards",
                "Premium ingredient sourcing and testing",
                "Luxury packaging with UV protection",
                "Extensive quality control and compliance",
                "Clean room manufacturing environment",
                "Automated production for consistency"
            ],
            "cost_optimization_suggestions": [
                "Leverage economies of scale for ingredient sourcing",
                "Invest in automated quality control processes",
                "Negotiate premium supplier contracts",
                "Optimize packaging design for cost efficiency",
                "Consider vertical integration for key ingredients"
            ]
        }
    }
    
    scale_info = scale_messages[scale_factors["scale"]]
    
    return {
        "raw_materials_cost": ingredient_cost,
        "capex_amortization": capex_amortization,
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
            "capex": capex_amortization,
            "labor": labor_cost,
            "packaging": packaging_cost,
            "overhead": overhead_cost,
            "quality_control": quality_control_cost
        },
        "scale_info": {
            "scale": scale_factors["scale"],
            "equipment_cost": scale_factors["equipment_cost"],
            "annual_batches": scale_factors["annual_batches"],
            "capex_per_batch": capex_amortization
        },
        "pricing_strategy": scale_info["pricing_strategy"],
        "market_positioning": scale_info["market_positioning"],
        "premium_factors": scale_info["premium_factors"],
        "cost_optimization_suggestions": scale_info["cost_optimization_suggestions"]
    }

def estimate_cost(request: CostingRequest) -> CostEstimate:
    """
    Generate comprehensive cost estimates for multiple batch sizes, supporting custom batch sizes.
    """
    formulation = request.formulation
    batch_pricing_list = []
    # Accept batch_sizes as list of str or int
    for batch_size in request.batch_sizes:
        if isinstance(batch_size, int):
            units = batch_size
            batch_size_label = f"custom_{units}"
        else:
            units = None
            batch_size_label = batch_size
        costing_data = calculate_realistic_premium_cogs(
            formulation.ingredients,
            batch_size_label,
            formulation.product_name,
            custom_units=units
        )
        batch_pricing = BatchPricing(
            batch_size=batch_size_label,
            unit_cost=costing_data["unit_cost"],
            total_cost=costing_data["total_production_cost"],
            retail_price=costing_data["retail_price_50ml"],
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
