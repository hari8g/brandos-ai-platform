import os
import json
from typing import List
from dotenv import load_dotenv
from openai import OpenAI
from app.models.generate import GenerateRequest, GenerateResponse, IngredientDetail, SupplierInfo
from typing import Optional

# Load environment variables from the root .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

# Initialize OpenAI client only if API key is available
client = None
try:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key != "your_openai_api_key_here" and api_key.strip():
        client = OpenAI(api_key=api_key)
        print("✅ OpenAI client initialized successfully")
        print(f"🔍 API Key found: {'Yes' if api_key else 'No'}")
        if api_key:
            print(f"🔍 API Key length: {len(api_key)}")
    else:
        print("⚠️ OpenAI API key not found or invalid, will use fallback mock data")
except Exception as e:
    print(f"⚠️ Failed to initialize OpenAI client: {e}")

def generate_formulation(req: GenerateRequest) -> GenerateResponse:
    """
    Use OpenAI to generate a real formulation based on the request.
    """
    print(f"🔍 Starting formulation generation for: {req.prompt}")
    category = (req.category or '').lower()
    # Check if OpenAI client is available
    if not client:
        print("🔄 Using fallback mock formulation (OpenAI not available)")
        return _generate_mock_formulation(req)
    print("✅ OpenAI client is available, proceeding with API call")
    try:
        # Create the prompt for OpenAI
        if category == "pet food":
            system_prompt = """You are an expert pet food formulator and animal nutritionist. Generate a detailed pet food formulation based on the user's request.

Return the response as a JSON object with the following structure:
{
    "product_name": "Descriptive product name",
    "reasoning": "A single narrative that includes inline per-ingredient 'why chosen' comments explaining the nutritional reasoning for each ingredient selection",
    "ingredients": [
        {
            "name": "Ingredient name",
            "percent": 5.0,
            "cost_per_kg": 2.0,
            "why_chosen": "Detailed explanation of why this specific ingredient was chosen for this formulation, including its benefits, compatibility, and role",
            "suppliers": [
                {
                    "name": "Supplier Company Name",
                    "contact": "Phone: +1-555-0123, Email: contact@supplier.com",
                    "location": "City, State/Country",
                    "price_per_unit": 15.50
                }
            ]
        }
    ],
    "manufacturing_steps": [
        "Step 1: Prepare equipment and sanitize all surfaces",
        "Step 2: Mix dry ingredients thoroughly",
        "Step 3: Add wet ingredients and blend",
        "Step 4: Extrude or bake as required",
        "Step 5: Package in appropriate containers"
    ],
    "estimated_cost": 15.0,
    "safety_notes": ["Safety note 1", "Safety note 2"],
    "packaging_marketing_inspiration": "Creative packaging and marketing ideas for this product",
    "market_trends": ["Current trend 1", "Current trend 2"],
    "competitive_landscape": {
        "price_range": "₹200-800 per kg",
        "target_demographics": "Dog owners, cat owners, etc.",
        "distribution_channels": "Pet stores, online, veterinary clinics",
        "key_competitors": "Brand X, Brand Y, Brand Z"
    },
    "scientific_reasoning": {
        "keyComponents": [
            {"name": "Ingredient Name (Percentage)", "why": "Scientific explanation of why this ingredient was chosen"}
        ],
        "impliedDesire": "What the customer is really looking for based on their request",
        "targetAudience": "Specific demographic and psychographic profile of the target customer",
        "indiaTrends": [
            "Current trend 1 in the Indian market",
            "Current trend 2 in the Indian market"
        ],
        "regulatoryStandards": [
            "FSSAI compliance requirement 1",
            "FSSAI compliance requirement 2"
        ]
    },
    "market_research": {
        "tam": {
            "marketSize": "₹15,000 Crore",
            "cagr": "12.5%",
            "methodology": "Based on total Indian pet food market size from IBEF and FICCI reports, considering all potential pet owners across India",
            "insights": [
                "Growing pet humanization trend driving premium pet food demand",
                "Urbanization increasing pet ownership rates",
                "Rising disposable income enabling premium pet food purchases"
            ],
            "competitors": [
                "Pedigree (Mars Petcare)",
                "Royal Canin",
                "Purina (Nestle)",
                "Himalaya Pet Food",
                "Drools"
            ]
        },
        "sam": {
            "marketSize": "₹3,500 Crore",
            "segments": [
                "Premium pet food segment (Tier 1 & 2 cities)",
                "Health-conscious pet owners",
                "Urban pet parents aged 25-45"
            ],
            "methodology": "Narrowed to premium segment based on product positioning, geographic focus on urban areas, and target demographic analysis",
            "insights": [
                "Premium segment growing at 18% annually",
                "Online channels capturing 40% of sales",
                "Health-focused formulations driving growth"
            ],
            "distribution": [
                "E-commerce platforms (Amazon, Flipkart)",
                "Specialty pet stores",
                "Veterinary clinics",
                "Direct-to-consumer channels"
            ]
        },
        "tm": {
            "marketSize": "₹800 Crore",
            "targetUsers": "2.5 Million households",
            "revenue": "₹320 Crore (Year 1)",
            "methodology": "Further narrowed to specific product category, price point, and target customer profile based on formulation characteristics",
            "insights": [
                "High willingness to pay for premium formulations",
                "Strong brand loyalty in premium segment",
                "Health benefits drive purchase decisions"
            ],
            "adoptionDrivers": [
                "Pet health consciousness",
                "Premium ingredient demand",
                "Veterinary recommendations",
                "Social media influence"
            ]
        }
    }
}

Guidelines:
- Total ingredients should add up to 100%
- Use realistic ingredient percentages
- Include proper vitamins, minerals, and supplements
- Consider the target animal, age, and dietary needs
- Provide detailed nutritional reasoning with per-ingredient explanations
- Include safety considerations
- Use ingredients appropriate for the animal and product type
- For each ingredient, provide 2-3 Indian suppliers (prefer Indian companies, cities, and contact info) with realistic contact information and pricing
- Manufacturing steps should be detailed and sequential
- Include current market trends and competitive analysis
- Make supplier information realistic but fictional for demonstration purposes
- Include comprehensive scientific reasoning with key components, target audience analysis, and Indian market trends
- Include detailed market research with TAM, SAM, and TM analysis using latest Indian market data
"""
        elif category == "wellness":
            system_prompt = """You are an expert wellness supplement formulator and nutritionist. Generate a detailed supplement formulation based on the user's request.

Return the response as a JSON object with the following structure:
{
    "product_name": "Descriptive product name",
    "reasoning": "A single narrative that includes inline per-ingredient 'why chosen' comments explaining the scientific reasoning for each ingredient selection",
    "ingredients": [
        {
            "name": "Ingredient name",
            "percent": 5.0,
            "cost_per_kg": 2.0,
            "why_chosen": "Detailed explanation of why this specific ingredient was chosen for this formulation, including its benefits, compatibility, and role",
            "suppliers": [
                {
                    "name": "Supplier Company Name",
                    "contact": "Phone: +1-555-0123, Email: contact@supplier.com",
                    "location": "City, State/Country",
                    "price_per_unit": 15.50
                }
            ]
        }
    ],
    "manufacturing_steps": [
        "Step 1: Prepare equipment and sanitize all surfaces",
        "Step 2: Blend active and excipient ingredients",
        "Step 3: Encapsulate, tableting, or powder fill as required",
        "Step 4: Package in appropriate containers"
    ],
    "estimated_cost": 15.0,
    "safety_notes": ["Safety note 1", "Safety note 2"],
    "packaging_marketing_inspiration": "Creative packaging and marketing ideas for this product",
    "market_trends": ["Current trend 1", "Current trend 2"],
    "competitive_landscape": {
        "price_range": "₹300-1200 per bottle",
        "target_demographics": "Adults, athletes, etc.",
        "distribution_channels": "Pharmacies, online, wellness stores",
        "key_competitors": "Brand A, Brand B, Brand C"
    },
    "scientific_reasoning": {
        "keyComponents": [
            {"name": "Ingredient Name (Percentage)", "why": "Scientific explanation of why this ingredient was chosen"}
        ],
        "impliedDesire": "What the customer is really looking for based on their request",
        "targetAudience": "Specific demographic and psychographic profile of the target customer",
        "indiaTrends": [
            "Current trend 1 in the Indian market",
            "Current trend 2 in the Indian market"
        ],
        "regulatoryStandards": [
            "FSSAI compliance requirement 1",
            "FSSAI compliance requirement 2"
        ]
    },
    "market_research": {
        "tam": {
            "marketSize": "₹25,000 Crore",
            "cagr": "15.2%",
            "methodology": "Based on total Indian nutraceutical and wellness supplement market from IBEF and FICCI reports",
            "insights": [
                "Growing health consciousness driving supplement demand",
                "Rising disposable income enabling premium wellness products",
                "Increasing awareness of preventive healthcare"
            ],
            "competitors": [
                "Himalaya Wellness",
                "Dabur",
                "Patanjali",
                "HealthVit",
                "Nature's Bounty"
            ]
        },
        "sam": {
            "marketSize": "₹6,000 Crore",
            "segments": [
                "Premium wellness supplements (Tier 1 & 2 cities)",
                "Health-conscious urban consumers",
                "Adults aged 25-55 with disposable income"
            ],
            "methodology": "Narrowed to premium wellness segment based on product positioning and target demographic",
            "insights": [
                "Premium segment growing at 20% annually",
                "Online channels capturing 60% of sales",
                "Science-backed formulations preferred"
            ],
            "distribution": [
                "E-commerce platforms",
                "Specialty health stores",
                "Pharmacies",
                "Direct-to-consumer channels"
            ]
        },
        "tm": {
            "marketSize": "₹1,200 Crore",
            "targetUsers": "4 Million consumers",
            "revenue": "₹480 Crore (Year 1)",
            "methodology": "Further narrowed to specific supplement category and target customer profile",
            "insights": [
                "High willingness to pay for quality formulations",
                "Strong preference for clinically proven ingredients",
                "Brand trust drives purchase decisions"
            ],
            "adoptionDrivers": [
                "Health consciousness",
                "Preventive healthcare awareness",
                "Doctor recommendations",
                "Social media influence"
            ]
        }
    }
}

Guidelines:
- Total ingredients should add up to 100%
- Use realistic ingredient percentages
- Include proper actives, excipients, and delivery forms
- Consider the target user and health goal
- Provide detailed scientific reasoning with per-ingredient explanations
- Include safety considerations
- Use ingredients appropriate for the supplement type
- For each ingredient, provide 2-3 Indian suppliers (prefer Indian companies, cities, and contact info) with realistic contact information and pricing
- Manufacturing steps should be detailed and sequential
- Include current market trends and competitive analysis
- Make supplier information realistic but fictional for demonstration purposes
- Include comprehensive scientific reasoning with key components, target audience analysis, and Indian market trends
- Include detailed market research with TAM, SAM, and TM analysis using latest Indian market data
"""
        else:
            system_prompt = """You are an expert cosmetic formulator and chemist. Generate a detailed formulation based on the user's request. 
            
            Return the response as a JSON object with the following structure:
            {
                "product_name": "Descriptive product name",
                "reasoning": "A single narrative that includes inline per-ingredient 'why chosen' comments explaining the scientific reasoning for each ingredient selection",
                "ingredients": [
                    {
                        "name": "Ingredient name",
                        "percent": 5.0,
                        "cost_per_100ml": 2.0,
                        "why_chosen": "Detailed explanation of why this specific ingredient was chosen for this formulation, including its benefits, compatibility, and role",
                        "suppliers": [
                            {
                                "name": "Supplier Company Name",
                                "contact": "Phone: +1-555-0123, Email: contact@supplier.com",
                                "location": "City, State/Country",
                                "price_per_unit": 15.50
                            }
                        ]
                    }
                ],
                "manufacturing_steps": [
                    "Step 1: Prepare equipment and sanitize all surfaces",
                    "Step 2: Heat water phase to 70°C while stirring",
                    "Step 3: Add oil phase ingredients and emulsify",
                    "Step 4: Cool to 40°C and add preservatives",
                    "Step 5: Package in appropriate containers"
                ],
                "estimated_cost": 15.0,
                "safety_notes": ["Safety note 1", "Safety note 2"],
                "packaging_marketing_inspiration": "Creative packaging and marketing ideas for this product",
                "market_trends": ["Current trend 1", "Current trend 2"],
                "competitive_landscape": {
                    "price_range": "₹500-1500 per 100ml",
                    "target_demographics": "Women aged 25-45",
                    "distribution_channels": "Online, specialty stores, pharmacies",
                    "key_competitors": "Brand A, Brand B, Brand C"
                },
                "scientific_reasoning": {
                    "keyComponents": [
                        {"name": "Ingredient Name (Percentage)", "why": "Scientific explanation of why this ingredient was chosen"}
                    ],
                    "impliedDesire": "What the customer is really looking for based on their request",
                    "targetAudience": "Specific demographic and psychographic profile of the target customer",
                    "indiaTrends": [
                        "Current trend 1 in the Indian market",
                        "Current trend 2 in the Indian market"
                    ],
                    "regulatoryStandards": [
                        "CDSCO compliance requirement 1",
                        "CDSCO compliance requirement 2"
                    ]
                },
                "market_research": {
                    "tam": {
                        "marketSize": "₹35,000 Crore",
                        "cagr": "18.5%",
                        "methodology": "Based on total Indian beauty and personal care market from IBEF and FICCI reports",
                        "insights": [
                            "Growing beauty consciousness driving premium product demand",
                            "Rising disposable income enabling luxury beauty purchases",
                            "Increasing awareness of skincare and beauty routines"
                        ],
                        "competitors": [
                            "L'Oreal India",
                            "Hindustan Unilever",
                            "Procter & Gamble",
                            "Lakme",
                            "Nykaa"
                        ]
                    },
                    "sam": {
                        "marketSize": "₹8,500 Crore",
                        "segments": [
                            "Premium beauty products (Tier 1 & 2 cities)",
                            "Beauty-conscious urban consumers",
                            "Women aged 18-45 with disposable income"
                        ],
                        "methodology": "Narrowed to premium beauty segment based on product positioning and target demographic",
                        "insights": [
                            "Premium segment growing at 22% annually",
                            "Online channels capturing 70% of sales",
                            "Science-backed formulations preferred"
                        ],
                        "distribution": [
                            "E-commerce platforms (Nykaa, Amazon)",
                            "Specialty beauty stores",
                            "Department stores",
                            "Direct-to-consumer channels"
                        ]
                    },
                    "tm": {
                        "marketSize": "₹2,000 Crore",
                        "targetUsers": "6 Million consumers",
                        "revenue": "₹800 Crore (Year 1)",
                        "methodology": "Further narrowed to specific product category and target customer profile",
                        "insights": [
                            "High willingness to pay for quality formulations",
                            "Strong preference for clinically proven ingredients",
                            "Brand trust drives purchase decisions"
                        ],
                        "adoptionDrivers": [
                            "Beauty consciousness",
                            "Skincare awareness",
                            "Influencer recommendations",
                            "Social media trends"
                        ]
                    }
                }
            }
            
            Guidelines:
            - Total ingredients should add up to 100%
            - Use realistic ingredient percentages
            - Include proper preservatives and stabilizers
            - Consider the target skin type and concerns
            - Provide detailed scientific reasoning with per-ingredient explanations
            - Include safety considerations
            - Use ingredients appropriate for the product type
            - For each ingredient, provide 2-3 Indian suppliers (prefer Indian companies, cities, and contact info) with realistic contact information and pricing
            - For the 'manufacturing_steps' section, output a 'Manufacturing Protocol' where:
              - Each step is numbered and titled (e.g., 'Step 1: Pre-heat mixing vessel').
              - For each step, include three sub-headings:
                - Why: A concise scientific or practical rationale explaining why this step is critical to product performance, stability, or safety.
                - How: A clear, actionable description of how to execute the step in a lab or pilot plant (including parameters like temperature, mixing speed, duration, order of addition, and safety/protective equipment).
                - Ecosystem: Recommendations on what equipment, suppliers, materials, software, or best-practice standards to rely on (e.g., 'Use a stainless-steel 5 L jacketed reactor from Supplier X; ensure GMP-compatible seals; monitor pH with a Y meter').
            - Format the manufacturing_steps as a JSON array, where each item is an object with:
              {
                "step_number": 1,
                "title": "Pre-heat mixing vessel",
                "why": "...",
                "how": "...",
                "ecosystem": "..."
              }
            - Manufacturing steps should be detailed and sequential
            - Include current market trends and competitive analysis
            - Make supplier information realistic but fictional for demonstration purposes
            - Include comprehensive scientific reasoning with key components, target audience analysis, and Indian market trends
            - Include detailed market research with TAM, SAM, and TM analysis using latest Indian market data
            """

        user_prompt = f"""
        Create a formulation for: {req.prompt}
        Category: {req.category or 'General'}
        Target cost: {req.target_cost or 'Not specified'}
        
        Please provide a complete, safe, and effective formulation with detailed ingredient rationales, local supplier information, and step-by-step manufacturing instructions.
        """

        print(f"📤 Sending request to OpenAI...")
        print(f"📝 User prompt: {user_prompt[:100]}...")

        # Call OpenAI
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=4000
        )

        # Parse the response
        content = response.choices[0].message.content
        print(f"📥 Received OpenAI response (length: {len(content)})")
        print(f"📄 Response preview: {content[:200]}...")
        
        # Try to extract JSON from the response
        try:
            # Find JSON in the response
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            
            if start_idx == -1 or end_idx == 0:
                print("❌ No JSON found in response")
                return _generate_mock_formulation(req)
                
            json_str = content[start_idx:end_idx]
            print(f"🔍 Extracted JSON (length: {len(json_str)})")
            
            data = json.loads(json_str)
            print(f"✅ JSON parsed successfully")
            print(f"📊 Found {len(data.get('ingredients', []))} ingredients")
            
            # Convert to IngredientDetail objects
            ingredients = []
            for ing_data in data.get('ingredients', []):
                suppliers = []
                for supplier_data in ing_data.get('suppliers', []):
                    # Calculate pricing per 100ml based on ingredient percentage and cost
                    ingredient_percent = float(ing_data.get('percent', 0))
                    ingredient_cost_per_100ml = float(ing_data.get('cost_per_100ml', 0))
                    price_per_100ml = (ingredient_cost_per_100ml * ingredient_percent / 100) if ingredient_percent > 0 else 0
                    
                    suppliers.append(SupplierInfo(
                        name=supplier_data.get('name', 'Unknown Supplier'),
                        contact=supplier_data.get('contact', 'Contact info not available'),
                        location=supplier_data.get('location', 'Location not specified'),
                        price_per_unit=float(supplier_data.get('price_per_unit', 0)),
                        price_per_100ml=price_per_100ml
                    ))
                
                ingredients.append(IngredientDetail(
                    name=ing_data.get('name', 'Unknown'),
                    percent=float(ing_data.get('percent', 0)),
                    cost_per_100ml=float(ing_data.get('cost_per_100ml', 0)),
                    why_chosen=ing_data.get('why_chosen', 'No rationale provided'),
                    suppliers=suppliers
                ))
            
            # Convert manufacturing_steps to simple strings if they are objects
            manufacturing_steps = data.get('manufacturing_steps', [])
            if manufacturing_steps and isinstance(manufacturing_steps[0], dict):
                # Convert complex objects to simple strings
                converted_steps = []
                for step in manufacturing_steps:
                    if isinstance(step, dict):
                        # Format: "Step X: Title - How"
                        step_num = step.get('step_number', '')
                        title = step.get('title', '')
                        how = step.get('how', '')
                        step_str = f"Step {step_num}: {title}"
                        if how:
                            step_str += f" - {how}"
                        converted_steps.append(step_str)
                    else:
                        converted_steps.append(str(step))
                manufacturing_steps = converted_steps
            
            # Get scientific reasoning from OpenAI response or use mock data
            scientific_reasoning = data.get('scientific_reasoning')
            
            # Check if the scientific reasoning is comprehensive (has our expected format)
            if not scientific_reasoning or not _is_comprehensive_scientific_reasoning(scientific_reasoning):
                # Use enhanced mock scientific reasoning if OpenAI didn't provide comprehensive data
                scientific_reasoning = _generate_scientific_reasoning(req.category or 'cosmetics', req.prompt)
            
            # Get market research from OpenAI response or use mock data
            market_research = data.get('market_research')
            
            # Check if market research is comprehensive (has our expected format)
            if not market_research or not _is_comprehensive_market_research(market_research):
                # Use enhanced mock market research if OpenAI didn't provide comprehensive data
                market_research = _generate_market_research(req.category or 'cosmetics', req.prompt)
            
            result = GenerateResponse(
                product_name=data.get('product_name', f"Custom {req.category or 'Product'}"),
                reasoning=data.get('reasoning', 'No reasoning provided'),
                ingredients=ingredients,
                manufacturing_steps=manufacturing_steps,
                estimated_cost=float(data.get('estimated_cost', 0)),
                safety_notes=data.get('safety_notes', []),
                packaging_marketing_inspiration=data.get('packaging_marketing_inspiration'),
                market_trends=data.get('market_trends'),
                competitive_landscape=data.get('competitive_landscape'),
                scientific_reasoning=scientific_reasoning,
                market_research=market_research
            )
            
            print(f"✅ Successfully generated formulation: {result.product_name}")
            return result
            
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"❌ Error parsing OpenAI response: {e}")
            print(f"🔍 Raw response: {content}")
            # Fallback to mock data if parsing fails
            return _generate_mock_formulation(req)
            
    except Exception as e:
        print(f"❌ OpenAI API error: {e}")
        print(f"🔍 Error type: {type(e).__name__}")
        # Fallback to mock data if OpenAI fails
        return _generate_mock_formulation(req)

def _is_comprehensive_scientific_reasoning(scientific_reasoning: dict) -> bool:
    """
    Check if the scientific reasoning data is comprehensive (has our expected format).
    """
    if not scientific_reasoning:
        return False
    
    # Check if it has all required fields
    required_fields = ['keyComponents', 'impliedDesire', 'targetAudience', 'indiaTrends', 'regulatoryStandards']
    if not all(field in scientific_reasoning for field in required_fields):
        return False
    
    # Check if keyComponents has functional attributes (not ingredient names)
    key_components = scientific_reasoning.get('keyComponents', [])
    if not key_components:
        return False
    
    # Check if the first component is a functional attribute (not ingredient-based)
    first_component = key_components[0].get('name', '')
    functional_indicators = ['Hydration', 'Brightening', 'Anti-Aging', 'Barrier', 'Nutrition', 'Digestive', 'Immune', 'Stress', 'Energy', 'Sleep']
    
    return any(indicator in first_component for indicator in functional_indicators)

def _is_comprehensive_market_research(market_research: dict) -> bool:
    """
    Check if the market research data is comprehensive (has our expected format).
    """
    if not market_research:
        return False
    
    # Check if it has all required fields
    required_fields = ['tam', 'sam', 'tm']
    if not all(field in market_research for field in required_fields):
        return False
    
    # Check if each section has the required sub-fields
    tam = market_research.get('tam', {})
    sam = market_research.get('sam', {})
    tm = market_research.get('tm', {})
    
    tam_required = ['marketSize', 'cagr', 'methodology', 'insights', 'competitors']
    sam_required = ['marketSize', 'segments', 'methodology', 'insights', 'distribution']
    tm_required = ['marketSize', 'targetUsers', 'revenue', 'methodology', 'insights', 'adoptionDrivers']
    
    if not all(field in tam for field in tam_required):
        return False
    if not all(field in sam for field in sam_required):
        return False
    if not all(field in tm for field in tm_required):
        return False
    
    return True

def _generate_scientific_reasoning(category: str, prompt: str) -> dict:
    """
    Generate comprehensive scientific reasoning data for the formulation.
    """
    if category == "pet food":
        return {
            "keyComponents": [
                {"name": "Protein-Rich Meat Sources (25-30%)", "why": "Essential amino acids for muscle development and maintenance, providing complete nutrition for active pets"},
                {"name": "Complex Carbohydrates (15-20%)", "why": "Sustained energy release and digestive health support through fiber-rich ingredients"},
                {"name": "Essential Fatty Acids (8-12%)", "why": "Omega-3 and Omega-6 for healthy skin, coat, and cognitive function"},
                {"name": "Vitamin & Mineral Complex (3-5%)", "why": "Comprehensive micronutrient support for overall health and immune system function"},
                {"name": "Natural Preservatives (1-2%)", "why": "Ensures product stability and safety throughout shelf life while maintaining nutritional integrity"}
            ],
            "impliedDesire": "Pet parents want premium nutrition that supports their pet's health, vitality, and longevity through scientifically-formulated, high-quality ingredients that deliver visible results in energy, coat condition, and overall wellness.",
            "psychologicalDrivers": [
                "Desire for visible, measurable results in pet health and vitality",
                "Trust in scientific validation and clinical backing for pet nutrition",
                "Preference for premium, transparent formulations with clear ingredient lists",
                "Willingness to invest in proven efficacy and long-term health benefits",
                "Emotional connection to pet wellness and quality of life"
            ],
            "valueProposition": [
                "Science-backed formulations with clinical validation for pet nutrition",
                "Transparent ingredient sourcing and quality standards",
                "Results-driven approach with measurable outcomes in pet health",
                "Premium nutrition that supports pet longevity and vitality",
                "Comprehensive health benefits from a single, trusted product"
            ],
            "targetAudience": "Urban pet parents aged 25-45 with disposable income, who prioritize their pet's health and are willing to invest in premium nutrition. They are health-conscious, research-oriented, and value transparency in ingredient sourcing and nutritional science.",
            "indiaTrends": [
                "Pet humanization trend driving premium pet food demand, with 65% of urban pet owners willing to pay premium for quality nutrition (Nielsen India, Dec 2024)",
                "Growing awareness of pet nutrition science, with 78% of pet parents researching ingredients before purchase (IBEF Pet Care Report, Nov 2024)",
                "E-commerce pet food sales growing at 45% annually, with premium segment leading growth (RedSeer Consulting, Dec 2024)"
            ],
            "regulatoryStandards": [
                "FSSAI compliance for pet food manufacturing and labeling requirements",
                "BIS standards for pet food quality and safety parameters",
                "Import regulations for pet food ingredients and finished products"
            ]
        }
    elif category == "wellness":
        return {
            "keyComponents": [
                {"name": "Active Therapeutic Compounds (15-25%)", "why": "Clinically-proven bioactive ingredients that deliver targeted health benefits and measurable outcomes"},
                {"name": "Bioavailability Enhancers (8-12%)", "why": "Advanced delivery systems that maximize absorption and ensure optimal nutrient utilization"},
                {"name": "Synergistic Nutrient Complex (20-30%)", "why": "Comprehensive vitamin and mineral blend that supports overall wellness and immune function"},
                {"name": "Natural Stabilizers (3-5%)", "why": "Preserves ingredient potency and ensures product stability throughout shelf life"},
                {"name": "Quality Assurance System (2-3%)", "why": "Pharmaceutical-grade testing and validation to ensure safety, purity, and efficacy"}
            ],
            "impliedDesire": "Health-conscious consumers want scientifically-formulated supplements that deliver measurable health benefits, support their wellness goals, and provide peace of mind through clinical validation and premium quality standards.",
            "psychologicalDrivers": [
                "Desire for visible, measurable health improvements and wellness outcomes",
                "Trust in scientific validation and clinical backing for supplement efficacy",
                "Preference for premium, transparent formulations with proven ingredients",
                "Willingness to invest in preventive healthcare and long-term wellness",
                "Seeking peace of mind through quality-assured, safe formulations"
            ],
            "valueProposition": [
                "Science-backed formulations with clinical validation for health benefits",
                "Transparent ingredient sourcing and pharmaceutical-grade quality standards",
                "Results-driven approach with measurable wellness outcomes",
                "Preventive healthcare support with proven efficacy",
                "Comprehensive wellness benefits from trusted, premium formulations"
            ],
            "targetAudience": "Health-conscious adults aged 25-55 with disposable income, who prioritize preventive healthcare and are willing to invest in premium wellness solutions. They value clinical evidence, transparency, and results-driven formulations.",
            "indiaTrends": [
                "Preventive healthcare awareness growing 35% annually, with 72% of urban consumers investing in wellness supplements (IBEF Wellness Report, Nov 2024)",
                "Premium supplement segment expanding at 28% CAGR, driven by health consciousness and disposable income growth (McKinsey India, Dec 2024)",
                "E-commerce wellness sales capturing 60% of market, with science-backed formulations preferred by 85% of consumers (RedSeer Consulting, Dec 2024)"
            ],
            "regulatoryStandards": [
                "FSSAI nutraceutical regulations for supplement manufacturing and labeling",
                "CDSCO guidelines for health supplement safety and efficacy requirements",
                "BIS standards for supplement quality and testing protocols"
            ]
        }
    else:  # cosmetics/skincare
        return {
            "keyComponents": [
                {"name": "Active Therapeutic Ingredients (8-15%)", "why": "Clinically-proven actives that deliver visible results in skin health, appearance, and anti-aging benefits"},
                {"name": "Advanced Delivery Systems (5-10%)", "why": "Penetration enhancers and encapsulation technologies that maximize ingredient efficacy and skin absorption"},
                {"name": "Skin Barrier Support (12-20%)", "why": "Ceramides, fatty acids, and lipids that strengthen and repair the skin's natural protective barrier"},
                {"name": "Antioxidant Protection (3-8%)", "why": "Free radical scavengers that protect against environmental damage and premature aging"},
                {"name": "Stability & Preservation (2-5%)", "why": "Advanced preservative systems that ensure product safety and ingredient potency throughout shelf life"}
            ],
            "impliedDesire": "Beauty-conscious consumers want scientifically-formulated skincare that delivers visible results, supports skin health, and provides a premium experience through clinically-proven ingredients and advanced formulation technology.",
            "psychologicalDrivers": [
                "Desire for visible, measurable improvements in skin appearance and health",
                "Trust in scientific validation and clinical backing for skincare efficacy",
                "Preference for premium, transparent formulations with proven ingredients",
                "Willingness to invest in proven results and long-term skin health",
                "Seeking confidence through improved skin appearance and texture"
            ],
            "valueProposition": [
                "Science-backed formulations with clinical validation for skin benefits",
                "Transparent ingredient sourcing and premium quality standards",
                "Results-driven approach with measurable skin improvements",
                "Advanced formulation technology for optimal ingredient delivery",
                "Comprehensive skin health benefits from trusted, premium products"
            ],
            "targetAudience": "Beauty-conscious consumers aged 18-45 with disposable income, who prioritize skin health and are willing to invest in premium skincare. They value clinical evidence, ingredient transparency, and results-driven formulations.",
            "indiaTrends": [
                "Premium skincare market growing at 25% annually, with 68% of consumers willing to pay premium for proven results (IBEF Beauty Report, Nov 2024)",
                "Science-backed formulations preferred by 82% of beauty consumers, with clinical validation driving purchase decisions (McKinsey India, Dec 2024)",
                "E-commerce beauty sales capturing 70% of market, with premium segment leading growth at 35% annually (RedSeer Consulting, Dec 2024)"
            ],
            "regulatoryStandards": [
                "CDSCO cosmetic regulations for safety and efficacy requirements",
                "BIS standards for cosmetic quality and testing protocols",
                "Import regulations for cosmetic ingredients and finished products"
            ]
        }

def _generate_market_research(category: str, prompt: str) -> dict:
    """
    Generate comprehensive market research data with TAM, SAM, and TM analysis.
    """
    if category == "pet food":
        return {
            "tam": {
                "marketSize": "₹15,000 Crore",
                "cagr": "12.5%",
                "methodology": "Based on total Indian pet food market size from IBEF and FICCI reports, considering all potential pet owners across India",
                "insights": [
                    "Growing pet humanization trend driving premium pet food demand",
                    "Urbanization increasing pet ownership rates",
                    "Rising disposable income enabling premium pet food purchases"
                ],
                "competitors": [
                    "Pedigree (Mars Petcare)",
                    "Royal Canin",
                    "Purina (Nestle)",
                    "Himalaya Pet Food",
                    "Drools"
                ]
            },
            "sam": {
                "marketSize": "₹3,500 Crore",
                "segments": [
                    "Premium pet food segment (Tier 1 & 2 cities)",
                    "Health-conscious pet owners",
                    "Urban pet parents aged 25-45"
                ],
                "methodology": "Narrowed to premium segment based on product positioning, geographic focus on urban areas, and target demographic analysis",
                "insights": [
                    "Premium segment growing at 18% annually",
                    "Online channels capturing 40% of sales",
                    "Health-focused formulations driving growth"
                ],
                "distribution": [
                    "E-commerce platforms (Amazon, Flipkart)",
                    "Specialty pet stores",
                    "Veterinary clinics",
                    "Direct-to-consumer channels"
                ]
            },
            "tm": {
                "marketSize": "₹800 Crore",
                "targetUsers": "2.5 Million households",
                "revenue": "₹320 Crore (Year 1)",
                "methodology": "Further narrowed to specific product category, price point, and target customer profile based on formulation characteristics",
                "insights": [
                    "High willingness to pay for premium formulations",
                    "Strong brand loyalty in premium segment",
                    "Health benefits drive purchase decisions"
                ],
                "adoptionDrivers": [
                    "Pet health consciousness",
                    "Premium ingredient demand",
                    "Veterinary recommendations",
                    "Social media influence"
                ]
            }
        }
    elif category == "wellness":
        return {
            "tam": {
                "marketSize": "₹25,000 Crore",
                "cagr": "15.2%",
                "methodology": "Based on total Indian nutraceutical and wellness supplement market from IBEF and FICCI reports",
                "insights": [
                    "Growing health consciousness driving supplement demand",
                    "Rising disposable income enabling premium wellness products",
                    "Increasing awareness of preventive healthcare"
                ],
                "competitors": [
                    "Himalaya Wellness",
                    "Dabur",
                    "Patanjali",
                    "HealthVit",
                    "Nature's Bounty"
                ]
            },
            "sam": {
                "marketSize": "₹6,000 Crore",
                "segments": [
                    "Premium wellness supplements (Tier 1 & 2 cities)",
                    "Health-conscious urban consumers",
                    "Adults aged 25-55 with disposable income"
                ],
                "methodology": "Narrowed to premium wellness segment based on product positioning and target demographic",
                "insights": [
                    "Premium segment growing at 20% annually",
                    "Online channels capturing 60% of sales",
                    "Science-backed formulations preferred"
                ],
                "distribution": [
                    "E-commerce platforms",
                    "Specialty health stores",
                    "Pharmacies",
                    "Direct-to-consumer channels"
                ]
            },
            "tm": {
                "marketSize": "₹1,200 Crore",
                "targetUsers": "4 Million consumers",
                "revenue": "₹480 Crore (Year 1)",
                "methodology": "Further narrowed to specific supplement category and target customer profile",
                "insights": [
                    "High willingness to pay for quality formulations",
                    "Strong preference for clinically proven ingredients",
                    "Brand trust drives purchase decisions"
                ],
                "adoptionDrivers": [
                    "Health consciousness",
                    "Preventive healthcare awareness",
                    "Doctor recommendations",
                    "Social media influence"
                ]
            }
        }
    else:  # cosmetics/skincare
        return {
            "tam": {
                "marketSize": "₹35,000 Crore",
                "cagr": "18.5%",
                "methodology": "Based on total Indian beauty and personal care market from IBEF and FICCI reports",
                "insights": [
                    "Growing beauty consciousness driving premium product demand",
                    "Rising disposable income enabling luxury beauty purchases",
                    "Increasing awareness of skincare and beauty routines"
                ],
                "competitors": [
                    "L'Oreal India",
                    "Hindustan Unilever",
                    "Procter & Gamble",
                    "Lakme",
                    "Nykaa"
                ]
            },
            "sam": {
                "marketSize": "₹8,500 Crore",
                "segments": [
                    "Premium beauty products (Tier 1 & 2 cities)",
                    "Beauty-conscious urban consumers",
                    "Women aged 18-45 with disposable income"
                ],
                "methodology": "Narrowed to premium beauty segment based on product positioning and target demographic",
                "insights": [
                    "Premium segment growing at 22% annually",
                    "Online channels capturing 70% of sales",
                    "Science-backed formulations preferred"
                ],
                "distribution": [
                    "E-commerce platforms (Nykaa, Amazon)",
                    "Specialty beauty stores",
                    "Department stores",
                    "Direct-to-consumer channels"
                ]
            },
            "tm": {
                "marketSize": "₹2,000 Crore",
                "targetUsers": "6 Million consumers",
                "revenue": "₹800 Crore (Year 1)",
                "methodology": "Further narrowed to specific product category and target customer profile",
                "insights": [
                    "High willingness to pay for quality formulations",
                    "Strong preference for clinically proven ingredients",
                    "Brand trust drives purchase decisions"
                ],
                "adoptionDrivers": [
                    "Beauty consciousness",
                    "Skincare awareness",
                    "Influencer recommendations",
                    "Social media trends"
                ]
            }
        }

def _generate_mock_formulation(req: GenerateRequest) -> GenerateResponse:
    """
    Fallback mock formulation generator with premium pricing.
    """
    category = (req.category or '').lower()
    if category == "pet food":
        # Pet food mock formulation
        return GenerateResponse(
            product_name=f"Premium {category.title()} Formula",
            reasoning=f"Formulation generated for {req.prompt}. This premium pet food combines high-quality proteins, grains, and supplements for optimal animal health.",
            ingredients=[
                IngredientDetail(
                    name="Chicken Meal",
                    percent=30.0,
                    cost_per_100ml=20.0,
                    why_chosen="High-protein, easily digestible, and palatable for most dogs.",
                    suppliers=[
                        SupplierInfo(name="PetPro Foods", contact="Phone: +91-12345-67890", location="Pune, Maharashtra", price_per_unit=180.0),
                        SupplierInfo(name="Animal Nutrition Inc.", contact="Phone: +91-23456-78901", location="Hyderabad, Telangana", price_per_unit=200.0)
                    ]
                ),
                IngredientDetail(
                    name="Brown Rice",
                    percent=25.0,
                    cost_per_100ml=10.0,
                    why_chosen="Provides energy and is gentle on sensitive stomachs.",
                    suppliers=[
                        SupplierInfo(name="GrainMasters", contact="Phone: +91-34567-89012", location="Kolkata, West Bengal", price_per_unit=60.0)
                    ]
                ),
                IngredientDetail(
                    name="Chicken Fat",
                    percent=10.0,
                    cost_per_100ml=30.0,
                    why_chosen="Enhances flavor and provides essential fatty acids.",
                    suppliers=[
                        SupplierInfo(name="Pet Oils", contact="Phone: +91-45678-90123", location="Chennai, Tamil Nadu", price_per_unit=120.0)
                    ]
                ),
                IngredientDetail(
                    name="Dried Beet Pulp",
                    percent=5.0,
                    cost_per_100ml=15.0,
                    why_chosen="Source of fiber for digestive health.",
                    suppliers=[
                        SupplierInfo(name="FiberPlus", contact="Phone: +91-56789-01234", location="Delhi, NCR", price_per_unit=80.0)
                    ]
                ),
                IngredientDetail(
                    name="Vitamin & Mineral Premix",
                    percent=2.0,
                    cost_per_100ml=50.0,
                    why_chosen="Ensures complete and balanced nutrition.",
                    suppliers=[
                        SupplierInfo(name="NutriMix", contact="Phone: +91-67890-12345", location="Mumbai, Maharashtra", price_per_unit=300.0)
                    ]
                )
            ],
            manufacturing_steps=[
                "Step 1: Mix dry ingredients thoroughly",
                "Step 2: Add wet ingredients and blend",
                "Step 3: Extrude or bake as required",
                "Step 4: Cool and package in airtight bags"
            ],
            estimated_cost=600.0,
            safety_notes=[
                "Ensure all ingredients are fit for animal consumption.",
                "Store in a cool, dry place."
            ],
            packaging_marketing_inspiration="Premium resealable bags with pet-friendly graphics. Highlight 'Complete & Balanced Nutrition'.",
            market_trends=[
                "Grain-free and hypoallergenic diets",
                "Focus on natural ingredients and supplements"
            ],
            competitive_landscape={
                "price_range": "₹200-800 per kg",
                "target_demographics": "Dog owners, cat owners, etc.",
                "distribution_channels": "Pet stores, online, veterinary clinics",
                "key_competitors": "Brand X, Brand Y, Brand Z"
            },
            scientific_reasoning=_generate_scientific_reasoning(category, req.prompt)
        )
    elif category == "wellness":
        # Wellness supplement mock formulation
        return GenerateResponse(
            product_name=f"Premium {category.title()} Supplement",
            reasoning=f"Formulation generated for {req.prompt}. This supplement blend combines adaptogens, vitamins, and minerals for daily wellness support.",
            ingredients=[
                IngredientDetail(
                    name="Ashwagandha Extract",
                    percent=20.0,
                    cost_per_100ml=150.0,
                    why_chosen="Adaptogen for stress resilience and energy.",
                    suppliers=[
                        SupplierInfo(name="Herbal Roots", contact="Phone: +91-78901-23456", location="Bangalore, Karnataka", price_per_unit=500.0)
                    ]
                ),
                IngredientDetail(
                    name="Magnesium Citrate",
                    percent=15.0,
                    cost_per_100ml=80.0,
                    why_chosen="Supports muscle and nerve function.",
                    suppliers=[
                        SupplierInfo(name="Mineral Life", contact="Phone: +91-89012-34567", location="Ahmedabad, Gujarat", price_per_unit=200.0)
                    ]
                ),
                IngredientDetail(
                    name="Vitamin B Complex",
                    percent=5.0,
                    cost_per_100ml=100.0,
                    why_chosen="Supports energy metabolism and cognitive function.",
                    suppliers=[
                        SupplierInfo(name="VitaPlus", contact="Phone: +91-90123-45678", location="Pune, Maharashtra", price_per_unit=300.0)
                    ]
                )
            ],
            manufacturing_steps=[
                "Step 1: Blend all active and excipient ingredients",
                "Step 2: Encapsulate or fill into sachets",
                "Step 3: Package in tamper-evident bottles"
            ],
            estimated_cost=400.0,
            safety_notes=[
                "Consult a healthcare professional before use.",
                "Store in a cool, dry place."
            ],
            packaging_marketing_inspiration="Eco-friendly bottles with wellness branding. Highlight 'Clinically Studied Ingredients'.",
            market_trends=[
                "Adaptogen and herbal blends",
                "Focus on stress, sleep, and immunity support"
            ],
            competitive_landscape={
                "price_range": "₹300-1200 per bottle",
                "target_demographics": "Adults, athletes, etc.",
                "distribution_channels": "Pharmacies, online, wellness stores",
                "key_competitors": "Brand A, Brand B, Brand C"
            },
            scientific_reasoning=_generate_scientific_reasoning(category, req.prompt)
        )
    else:
        # Cosmetics/skincare mock formulation (original)
        ingredients = [
            IngredientDetail(
                name="Purified Water",
                percent=65.0,
                cost_per_100ml=0.5,
                why_chosen="Pharmaceutical-grade purified water serves as the primary solvent, ensuring the highest purity standards for premium formulations. It's essential for creating a stable, clean base that meets luxury skincare standards.",
                suppliers=[
                    SupplierInfo(
                        name="AquaPure Solutions",
                        contact="Phone: +91-98765-43210, Email: info@aquapure.com",
                        location="Mumbai, Maharashtra",
                        price_per_unit=0.25,
                        price_per_100ml=0.33
                    ),
                    SupplierInfo(
                        name="Clean Water Co.",
                        contact="Phone: +91-87654-32109, Email: sales@cleanwater.co.in",
                        location="Delhi, NCR",
                        price_per_unit=0.35,
                        price_per_100ml=0.46
                    )
                ]
            ),
            IngredientDetail(
                name="Hyaluronic Acid (1%)",
                percent=2.0,
                cost_per_100ml=45.0,
                why_chosen="High-molecular-weight hyaluronic acid provides intense hydration and plumping effects. This premium-grade ingredient creates a smooth, dewy finish and helps reduce fine lines and wrinkles.",
                suppliers=[
                    SupplierInfo(
                        name="ChemCorp India",
                        contact="Phone: +91-76543-21098, Email: hyaluronic@chemcorp.in",
                        location="Ahmedabad, Gujarat",
                        price_per_unit=2200.0,
                        price_per_100ml=0.90
                    ),
                    SupplierInfo(
                        name="Natural Ingredients Ltd",
                        contact="Phone: +91-65432-10987, Email: info@naturalingredients.com",
                        location="Bangalore, Karnataka",
                        price_per_unit=2800.0,
                        price_per_100ml=1.14
                    )
                ]
            ),
            IngredientDetail(
                name="Niacinamide (5%)",
                percent=5.0,
                cost_per_100ml=35.0,
                why_chosen="Pharmaceutical-grade niacinamide brightens skin tone, reduces hyperpigmentation, and strengthens the skin barrier. This concentration is optimal for visible results while maintaining skin tolerance.",
                suppliers=[
                    SupplierInfo(
                        name="Vitamins & More",
                        contact="Phone: +91-54321-09876, Email: niacinamide@vitamins.co.in",
                        location="Pune, Maharashtra",
                        price_per_unit=1800.0,
                        price_per_100ml=1.75
                    ),
                    SupplierInfo(
                        name="Premium Actives",
                        contact="Phone: +91-43210-98765, Email: sales@premiumactives.com",
                        location="Chennai, Tamil Nadu",
                        price_per_unit=2200.0,
                        price_per_100ml=2.14
                    )
                ]
            ),
            IngredientDetail(
                name="Glycerin (Vegetable)",
                percent=8.0,
                cost_per_100ml=12.0,
                why_chosen="Vegetable-derived glycerin is a superior humectant that attracts moisture from the environment. This premium grade ensures maximum hydration without stickiness, suitable for sensitive skin.",
                suppliers=[
                    SupplierInfo(
                        name="Organic Solutions",
                        contact="Phone: +91-32109-87654, Email: glycerin@organic.in",
                        location="Hyderabad, Telangana",
                        price_per_unit=600.0,
                        price_per_100ml=0.96
                    ),
                    SupplierInfo(
                        name="Green Chemistry",
                        contact="Phone: +91-21098-76543, Email: info@greenchemistry.com",
                        location="Kolkata, West Bengal",
                        price_per_unit=750.0,
                        price_per_100ml=1.20
                    )
                ]
            ),
            IngredientDetail(
                name="Ceramide Complex",
                percent=3.0,
                cost_per_100ml=28.0,
                why_chosen="A proprietary blend of ceramides that mimics the skin's natural lipid barrier. This premium complex strengthens skin resilience, reduces moisture loss, and provides long-lasting protection.",
                suppliers=[
                    SupplierInfo(
                        name="Lipid Sciences",
                        contact="Phone: +91-10987-65432, Email: ceramides@lipidsciences.in",
                        location="Mumbai, Maharashtra",
                        price_per_unit=1400.0,
                        price_per_100ml=0.84
                    )
                ]
            ),
            IngredientDetail(
                name="Vitamin E (Tocopherol)",
                percent=1.0,
                cost_per_100ml=18.0,
                why_chosen="Natural vitamin E provides antioxidant protection against free radicals and environmental damage. This premium grade helps maintain skin elasticity and promotes healing.",
                suppliers=[
                    SupplierInfo(
                        name="Vitamin World",
                        contact="Phone: +91-09876-54321, Email: vitamine@vitaminworld.co.in",
                        location="Delhi, NCR",
                        price_per_unit=900.0,
                        price_per_100ml=0.18
                    )
                ]
            ),
            IngredientDetail(
                name="Preservative System",
                percent=1.0,
                cost_per_100ml=8.0,
                why_chosen="A broad-spectrum preservative system that ensures product stability and safety throughout its shelf life. This premium blend is gentle on skin while providing maximum protection.",
                suppliers=[
                    SupplierInfo(
                        name="PreserveTech Solutions",
                        contact="Phone: +91-54321-09876, Email: sales@preservetech.in",
                        location="Pune, Maharashtra",
                        price_per_unit=400.0,
                        price_per_100ml=0.08
                    )
                ]
            ),
            IngredientDetail(
                name="Fragrance (Natural)",
                percent=0.5,
                cost_per_100ml=15.0,
                why_chosen="A carefully crafted natural fragrance blend that provides a luxurious sensory experience without irritating sensitive skin. This premium fragrance enhances the overall user experience.",
                suppliers=[
                    SupplierInfo(
                        name="Natural Scents",
                        contact="Phone: +91-43210-98765, Email: info@naturalscents.in",
                        location="Mysore, Karnataka",
                        price_per_unit=750.0,
                        price_per_100ml=0.08
                    )
                ]
            ),
            IngredientDetail(
                name="Thickening Agent",
                percent=2.5,
                cost_per_100ml=6.0,
                why_chosen="A premium natural thickening agent that creates the perfect texture - not too thick, not too runny. This ensures optimal application and absorption.",
                suppliers=[
                    SupplierInfo(
                        name="Texture Solutions",
                        contact="Phone: +91-32109-87654, Email: thickeners@texture.in",
                        location="Ahmedabad, Gujarat",
                        price_per_unit=300.0,
                        price_per_100ml=0.15
                    )
                ]
            ),
            IngredientDetail(
                name="pH Adjuster",
                percent=0.5,
                cost_per_100ml=4.0,
                why_chosen="A gentle pH adjuster that maintains the optimal pH level (5.5-6.0) for skin health. This ensures maximum ingredient efficacy and skin compatibility.",
                suppliers=[
                    SupplierInfo(
                        name="pH Solutions",
                        contact="Phone: +91-21098-76543, Email: ph@phsolutions.in",
                        location="Bangalore, Karnataka",
                        price_per_unit=200.0,
                        price_per_100ml=0.02
                    )
                ]
            )
        ]
        
        # Calculate total ingredient cost
        total_ingredient_cost = sum(ing.cost_per_100ml * ing.percent / 100 for ing in ingredients)
        
        # Premium pricing structure
        manufacturing_cost = total_ingredient_cost * 0.15  # 15% of ingredient cost
        packaging_cost = total_ingredient_cost * 0.25      # 25% of ingredient cost
        quality_control = total_ingredient_cost * 0.10     # 10% of ingredient cost
        total_cost = total_ingredient_cost + manufacturing_cost + packaging_cost + quality_control
        
        return GenerateResponse(
            product_name=f"Premium {req.category or 'Skincare'} Serum",
            reasoning=f"Formulation generated based on request: {req.prompt}. This premium formulation combines cutting-edge active ingredients with pharmaceutical-grade excipients. Each ingredient was carefully selected for its proven efficacy and premium positioning. The formulation follows luxury skincare standards with optimal concentrations for visible results while maintaining skin safety and tolerance.",
            ingredients=ingredients,
            manufacturing_steps=[
                "Step 1: Sanitize all equipment and work surfaces with 70% isopropyl alcohol in a clean room environment",
                "Step 2: Heat purified water to 75°C in a stainless steel vessel with continuous monitoring",
                "Step 3: Add glycerin and niacinamide to the water phase and stir until completely dissolved",
                "Step 4: Cool the mixture to 45°C while maintaining gentle agitation under controlled conditions",
                "Step 5: Add hyaluronic acid solution and stir for 10 minutes to ensure proper hydration",
                "Step 6: Incorporate ceramide complex and vitamin E with gentle mixing to maintain stability",
                "Step 7: Add preservative system and stir for 5 minutes to ensure uniform distribution",
                "Step 8: Adjust pH to 5.8 ± 0.2 using gentle pH adjuster with continuous monitoring",
                "Step 9: Add natural fragrance and thickening agent with final mixing for 3 minutes",
                "Step 10: Perform quality control tests including pH, viscosity, and appearance",
                "Step 11: Transfer to clean, sanitized premium packaging under controlled conditions",
                "Step 12: Label with batch number and expiry date, store in temperature-controlled environment"
            ],
            estimated_cost=total_cost,
            safety_notes=[
                "Patch test before first use, especially for sensitive skin",
                "Avoid contact with eyes and mucous membranes",
                "Discontinue use if irritation occurs",
                "Store in a cool, dry place away from direct sunlight",
                "Keep out of reach of children"
            ],
            packaging_marketing_inspiration="Premium glass bottles with airless pump technology and minimalist luxury branding. Emphasize 'Clinically Proven Ingredients' and 'Dermatologist Tested' claims. Use sustainable packaging materials and include detailed ingredient transparency.",
            market_trends=[
                "Clean beauty movement gaining momentum",
                "Science-backed formulations preferred",
                "Multi-functional products in demand",
                "Sustainable packaging requirements"
            ],
            competitive_landscape={
                "price_range": "₹800-2500 per 30ml",
                "target_demographics": "Women aged 25-45 with disposable income",
                "distribution_channels": "Online, specialty stores, department stores",
                "key_competitors": "L'Oreal, Estee Lauder, Clinique, The Ordinary"
            },
            scientific_reasoning=_generate_scientific_reasoning(category, req.prompt),
            market_research=_generate_market_research(category, req.prompt)
        )
