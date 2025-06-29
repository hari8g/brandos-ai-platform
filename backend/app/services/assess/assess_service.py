from ..models.assess import AssessRequest, AssessResponse

def assess_query(req: AssessRequest) -> AssessResponse:
    """
    Evaluate prompt quality.
    """
    # TODO: implement real logic
    return AssessResponse(score=0.5, can_generate=True)
