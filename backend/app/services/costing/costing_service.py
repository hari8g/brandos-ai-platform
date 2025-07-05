from app.models.generate import GenerateResponse
from app.models.costing import SimpleCostEstimate, BatchPricing, CostingRequest, CostingResponse
from typing import List

def calculate_simple_costing(formulation: GenerateResponse, batch_sizes: List[str] = ["small", "medium", "large"]) -> SimpleCostEstimate:
    """
    Calculate simple and effective costing for different batch sizes.
    """
    
    # Batch size configurations
    batch_configs = {
        "small": {"units": 250, "margin": 0.70, "scale_factor": 1.0},
        "medium": {"units": 2500, "margin": 0.75, "scale_factor": 0.85},
        "large": {"units": 20000, "margin": 0.80, "scale_factor": 0.70}
    }
    
    # Calculate total ingredient cost per 100ml
    total_ingredient_cost_per_100ml = sum(
        ing.cost_per_100ml * ing.percent / 100 for ing in formulation.ingredients
    )
    
    batch_pricing_list = []
    
    for batch_size in batch_sizes:
        config = batch_configs[batch_size]
        units = config["units"]
        margin = config["margin"]
        scale_factor = config["scale_factor"]
        
        # Calculate costs
        ingredient_cost = total_ingredient_cost_per_100ml * units * scale_factor
        manufacturing_cost = ingredient_cost * 0.25  # 25% of ingredient cost
        packaging_cost = ingredient_cost * 0.20     # 20% of ingredient cost
        overhead_cost = ingredient_cost * 0.15      # 15% of ingredient cost
        
        total_cost = ingredient_cost + manufacturing_cost + packaging_cost + overhead_cost
        unit_cost = total_cost / units
        
        # Calculate pricing
        wholesale_price = total_cost * (1 + margin)
        retail_price_30ml = unit_cost * 30 * (1 + margin)
        retail_price_50ml = unit_cost * 50 * (1 + margin)
        retail_price_100ml = unit_cost * 100 * (1 + margin)
        
        batch_pricing = BatchPricing(
            batch_size=batch_size,
            units=units,
            unit_cost=unit_cost,
            total_cost=total_cost,
            retail_price_30ml=retail_price_30ml,
            retail_price_50ml=retail_price_50ml,
            retail_price_100ml=retail_price_100ml,
            wholesale_price=wholesale_price,
            profit_margin=margin * 100
        )
        
        batch_pricing_list.append(batch_pricing)
    
    # Determine pricing strategy and market positioning
    pricing_strategy = f"Multi-tier pricing strategy for {formulation.product_name} with economies of scale"
    market_positioning = "Premium positioning with competitive pricing across all batch sizes"
    
    return SimpleCostEstimate(
        batch_pricing=batch_pricing_list,
        total_ingredient_cost=total_ingredient_cost_per_100ml,
        manufacturing_cost=total_ingredient_cost_per_100ml * 0.25,
        packaging_cost=total_ingredient_cost_per_100ml * 0.20,
        overhead_cost=total_ingredient_cost_per_100ml * 0.15,
        currency="INR",
        pricing_strategy=pricing_strategy,
        market_positioning=market_positioning
    )

def estimate_cost(request: CostingRequest) -> SimpleCostEstimate:
    """
    Estimate cost using the simplified costing model.
    """
    return calculate_simple_costing(request.formulation, request.batch_sizes)
