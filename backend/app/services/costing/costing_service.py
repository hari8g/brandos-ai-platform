from app.models.generate import Formulation
from app.models.costing import CostEstimate

def estimate_cost(formulation: Formulation) -> CostEstimate:
    """
    Sum up unit costs, margin, taxes.
    """
    # TODO: implement real logic
    return CostEstimate(raw_materials=0.0, margin=0.0, total=0.0)
