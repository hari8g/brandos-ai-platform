from typing import Dict, Any, List
import json

def compress_response_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compress response data by removing duplicates and using abbreviations.
    """
    if not isinstance(data, dict):
        return data
    
    compressed = {}
    
    # Compress ingredients data
    if 'ingredients' in data:
        compressed['ing'] = []
        for ing in data['ingredients']:
            compressed_ing = {
                'n': ing.get('name', ''),  # name
                'p': ing.get('percent', 0),  # percent
                'w': ing.get('why_chosen', ''),  # why_chosen
                'c': ing.get('cost_per_100ml', 0)  # cost_per_100ml
            }
            if 'suppliers' in ing:
                compressed_ing['s'] = [
                    {
                        'n': s.get('name', ''),  # name
                        'c': s.get('contact', ''),  # contact
                        'l': s.get('location', ''),  # location
                        'p': s.get('price_per_unit', 0)  # price_per_unit
                    }
                    for s in ing['suppliers']
                ]
            compressed['ing'].append(compressed_ing)
    
    # Compress scientific reasoning
    if 'scientific_reasoning' in data:
        sr = data['scientific_reasoning']
        compressed['sr'] = {
            'kc': [comp.get('name', '') for comp in sr.get('keyComponents', [])],  # keyComponents (names only)
            'id': sr.get('impliedDesire', ''),  # impliedDesire
            'pd': sr.get('psychologicalDrivers', []),  # psychologicalDrivers
            'vp': sr.get('valueProposition', []),  # valueProposition
            'ta': sr.get('targetAudience', ''),  # targetAudience
            'it': sr.get('indiaTrends', []),  # indiaTrends
            'rs': sr.get('regulatoryStandards', []),  # regulatoryStandards
            'db': sr.get('demographicBreakdown'),  # demographicBreakdown
            'pp': sr.get('psychographicProfile'),  # psychographicProfile
            'mos': sr.get('marketOpportunitySummary', '')  # marketOpportunitySummary
        }
    
    # Compress market research
    if 'market_research' in data:
        mr = data['market_research']
        compressed['mr'] = {
            'tam': {
                'v': mr.get('tam', {}).get('marketSize', ''),  # value
                'c': mr.get('tam', {}).get('cagr', ''),  # cagr
                'm': mr.get('tam', {}).get('methodology', '')  # methodology
            },
            'sam': {
                'v': mr.get('sam', {}).get('marketSize', ''),  # value
                's': mr.get('sam', {}).get('segments', []),  # segments
                'm': mr.get('sam', {}).get('methodology', '')  # methodology
            },
            'tm': {
                'v': mr.get('tm', {}).get('marketSize', ''),  # value
                'tu': mr.get('tm', {}).get('targetUsers', ''),  # targetUsers
                'r': mr.get('tm', {}).get('revenue', '')  # revenue
            }
        }
    
    # Keep essential fields uncompressed
    essential_fields = ['product_name', 'reasoning', 'manufacturing_steps', 'estimated_cost', 'safety_notes']
    for field in essential_fields:
        if field in data:
            compressed[field] = data[field]
    
    return compressed

def decompress_response_data(compressed_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Decompress response data by expanding abbreviations and restoring structure.
    """
    if not isinstance(compressed_data, dict):
        return compressed_data
    
    decompressed = {}
    
    # Decompress ingredients
    if 'ing' in compressed_data:
        decompressed['ingredients'] = []
        for ing in compressed_data['ing']:
            decompressed_ing = {
                'name': ing.get('n', ''),
                'percent': ing.get('p', 0),
                'why_chosen': ing.get('w', ''),
                'cost_per_100ml': ing.get('c', 0)
            }
            if 's' in ing:
                decompressed_ing['suppliers'] = [
                    {
                        'name': s.get('n', ''),
                        'contact': s.get('c', ''),
                        'location': s.get('l', ''),
                        'price_per_unit': s.get('p', 0)
                    }
                    for s in ing['s']
                ]
            decompressed['ingredients'].append(decompressed_ing)
    
    # Decompress scientific reasoning
    if 'sr' in compressed_data:
        sr = compressed_data['sr']
        decompressed['scientific_reasoning'] = {
            'keyComponents': [{'name': name, 'why': ''} for name in sr.get('kc', [])],
            'impliedDesire': sr.get('id', ''),
            'psychologicalDrivers': sr.get('pd', []),
            'valueProposition': sr.get('vp', []),
            'targetAudience': sr.get('ta', ''),
            'indiaTrends': sr.get('it', []),
            'regulatoryStandards': sr.get('rs', []),
            'demographicBreakdown': sr.get('db'),
            'psychographicProfile': sr.get('pp'),
            'marketOpportunitySummary': sr.get('mos', '')
        }
    
    # Decompress market research
    if 'mr' in compressed_data:
        mr = compressed_data['mr']
        decompressed['market_research'] = {
            'tam': {
                'marketSize': mr.get('tam', {}).get('v', ''),
                'cagr': mr.get('tam', {}).get('c', ''),
                'methodology': mr.get('tam', {}).get('m', '')
            },
            'sam': {
                'marketSize': mr.get('sam', {}).get('v', ''),
                'segments': mr.get('sam', {}).get('s', []),
                'methodology': mr.get('sam', {}).get('m', '')
            },
            'tm': {
                'marketSize': mr.get('tm', {}).get('v', ''),
                'targetUsers': mr.get('tm', {}).get('tu', ''),
                'revenue': mr.get('tm', {}).get('r', '')
            }
        }
    
    # Keep essential fields as-is
    essential_fields = ['product_name', 'reasoning', 'manufacturing_steps', 'estimated_cost', 'safety_notes']
    for field in essential_fields:
        if field in compressed_data:
            decompressed[field] = compressed_data[field]
    
    return decompressed

def remove_duplicate_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Remove duplicate information from response data.
    """
    if not isinstance(data, dict):
        return data
    
    cleaned = data.copy()
    
    # Remove duplicate ingredient information from scientific reasoning
    if 'scientific_reasoning' in cleaned and 'ingredients' in cleaned:
        sr = cleaned['scientific_reasoning']
        if 'keyComponents' in sr:
            # Keep only ingredient names, remove duplicate explanations
            ingredient_names = [ing.get('name', '') for ing in cleaned['ingredients']]
            sr['keyComponents'] = ingredient_names
    
    # Remove verbose calculation details, keep only essential metrics
    if 'market_research' in cleaned:
        mr = cleaned['market_research']
        for metric in ['tam', 'sam', 'tm']:
            if metric in mr and isinstance(mr[metric], dict):
                # Keep only essential fields
                essential_fields = ['marketSize', 'cagr', 'methodology', 'targetUsers', 'revenue']
                mr[metric] = {k: v for k, v in mr[metric].items() if k in essential_fields}
    
    return cleaned

def optimize_response_for_tokens(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Apply all optimization techniques to minimize token usage.
    """
    # Step 1: Remove duplicates
    data = remove_duplicate_data(data)
    
    # Step 2: Compress response
    data = compress_response_data(data)
    
    return data 