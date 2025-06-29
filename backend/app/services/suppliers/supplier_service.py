from ..models.suppliers import SupplierRequest, SupplierResponse

def lookup_suppliers(req: SupplierRequest) -> SupplierResponse:
    """
    Return list of suppliers for ingredients.
    """
    # TODO: implement real logic
    return SupplierResponse(suppliers=[])
