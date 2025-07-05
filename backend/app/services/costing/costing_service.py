from app.models.generate import GenerateResponse
from app.models.costing import ManufacturingScenario, ManufacturingInsights, ManufacturingRequest, ManufacturingResponse
from typing import List, Dict

def calculate_manufacturing_scenarios(formulation: GenerateResponse) -> ManufacturingInsights:
    """
    Calculate manufacturing scenarios for different customer scales.
    """
    
    # Calculate base ingredient cost per 100ml
    base_ingredient_cost_per_100ml = sum(
        ing.cost_per_100ml * ing.percent / 100 for ing in formulation.ingredients
    )
    
    # Safety check - if no ingredients or all costs are 0, use a default
    if base_ingredient_cost_per_100ml <= 0:
        base_ingredient_cost_per_100ml = 10.0  # Default cost per 100ml
    
    # Manufacturing scenarios configuration
    scenarios = {
        "small_scale": {
            "customer_scale": "1000",
            "batch_size": 1000,
            "total_customers": 1000,
            "scale_factor": 1.0,
            "margin": 0.60,
            "description": "Small batch manufacturing for 1,000 customers"
        },
        "medium_scale": {
            "customer_scale": "10k",
            "batch_size": 10000,
            "total_customers": 10000,
            "scale_factor": 0.75,
            "margin": 0.70,
            "description": "Medium scale for 10,000 customers"
        },
        "large_scale": {
            "customer_scale": "10k_plus",
            "batch_size": 50000,
            "total_customers": 50000,
            "scale_factor": 0.50,
            "margin": 0.80,
            "description": "Large scale for 50,000+ customers"
        }
    }
    
    manufacturing_scenarios = {}
    
    for scenario_key, config in scenarios.items():
        # Calculate costs with economies of scale
        ingredient_cost = base_ingredient_cost_per_100ml * config["batch_size"] * config["scale_factor"]
        manufacturing_cost = ingredient_cost * 0.30  # 30% of ingredient cost
        packaging_cost = ingredient_cost * 0.25      # 25% of ingredient cost
        overhead_cost = ingredient_cost * 0.20       # 20% of ingredient cost
        
        total_cost = ingredient_cost + manufacturing_cost + packaging_cost + overhead_cost
        
        # Safety check for division by zero
        if config["batch_size"] <= 0:
            cost_per_unit = 0
        else:
            cost_per_unit = total_cost / config["batch_size"]
        
        # Calculate pricing
        wholesale_price = total_cost * (1 + config["margin"])
        retail_price = cost_per_unit * 100 * (1 + config["margin"] * 1.5)  # Retail markup
        
        # Calculate revenue potential
        revenue_potential = retail_price * config["total_customers"]
        
        # Safety check for division by zero
        if retail_price <= 0:
            break_even_customers = 0
        else:
            break_even_customers = int(total_cost / retail_price)
        
        manufacturing_scenarios[scenario_key] = ManufacturingScenario(
            customer_scale=config["customer_scale"],
            batch_size=config["batch_size"],
            total_customers=config["total_customers"],
            manufacturing_cost=manufacturing_cost,
            ingredient_cost=ingredient_cost,
            packaging_cost=packaging_cost,
            overhead_cost=overhead_cost,
            total_cost=total_cost,
            cost_per_unit=cost_per_unit,
            retail_price=retail_price,
            wholesale_price=wholesale_price,
            profit_margin=config["margin"] * 100,
            revenue_potential=revenue_potential,
            break_even_customers=break_even_customers
        )
    
    # Generate insights
    scaling_benefits = [
        "Economies of scale reduce per-unit costs by 25-50%",
        "Bulk purchasing power for ingredients and packaging",
        "Automated manufacturing processes become viable",
        "Distribution networks become more efficient",
        "Marketing costs spread across larger customer base"
    ]
    
    risk_factors = [
        "Higher upfront investment required for scaling",
        "Increased inventory management complexity",
        "Need for larger storage and distribution facilities",
        "Market demand uncertainty at larger scales",
        "Competition intensifies with scale"
    ]
    
    market_opportunity = f"Manufacturing {formulation.product_name} presents a scalable opportunity with potential revenue of ₹{manufacturing_scenarios['large_scale'].revenue_potential:,.0f} at full scale, requiring strategic scaling decisions based on market demand and capital availability."
    
    return ManufacturingInsights(
        small_scale=manufacturing_scenarios["small_scale"],
        medium_scale=manufacturing_scenarios["medium_scale"],
        large_scale=manufacturing_scenarios["large_scale"],
        scaling_benefits=scaling_benefits,
        risk_factors=risk_factors,
        market_opportunity=market_opportunity
    )

def analyze_manufacturing(request: ManufacturingRequest) -> ManufacturingInsights:
    """
    Analyze manufacturing scenarios for different customer scales.
    """
    return calculate_manufacturing_scenarios(request.formulation)
