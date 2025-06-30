import os
import json
from typing import List
from openai import OpenAI
from dotenv import load_dotenv
from app.models.generate import GenerateRequest, GenerateResponse, IngredientDetail, SupplierInfo

# Load .env file
load_dotenv()

# Initialize OpenAI client only if API key is available
client = None
try:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and api_key != "your_openai_api_key_here":
        client = OpenAI(api_key=api_key)
        print("✅ OpenAI client initialized successfully")
    else:
        print("⚠️ OpenAI API key not found, will use fallback mock data")
except Exception as e:
    print(f"⚠️ Failed to initialize OpenAI client: {e}")

def generate_formulation(req: GenerateRequest) -> GenerateResponse:
    """
    Use OpenAI to generate a real formulation based on the request.
    """
    print(f"🔍 Starting formulation generation for: {req.prompt}")
    
    # Check if OpenAI client is available
    if not client:
        print("🔄 Using fallback mock formulation (OpenAI not available)")
        return _generate_mock_formulation(req)
    
    print("✅ OpenAI client is available, proceeding with API call")
    
    try:
        # Create the prompt for OpenAI
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
        - For each ingredient, provide 2-3 local suppliers with realistic contact information and pricing
        - Manufacturing steps should be detailed and sequential
        - Include current market trends and competitive analysis
        - Make supplier information realistic but fictional for demonstration purposes
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
            max_tokens=3000
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
                    suppliers.append(SupplierInfo(
                        name=supplier_data.get('name', 'Unknown Supplier'),
                        contact=supplier_data.get('contact', 'Contact info not available'),
                        location=supplier_data.get('location', 'Location not specified'),
                        price_per_unit=float(supplier_data.get('price_per_unit', 0))
                    ))
                
                ingredients.append(IngredientDetail(
                    name=ing_data.get('name', 'Unknown'),
                    percent=float(ing_data.get('percent', 0)),
                    cost_per_100ml=float(ing_data.get('cost_per_100ml', 0)),
                    why_chosen=ing_data.get('why_chosen', 'No rationale provided'),
                    suppliers=suppliers
                ))
            
            result = GenerateResponse(
                product_name=data.get('product_name', f"Custom {req.category or 'Product'}"),
                reasoning=data.get('reasoning', 'No reasoning provided'),
                ingredients=ingredients,
                manufacturing_steps=data.get('manufacturing_steps', []),
                estimated_cost=float(data.get('estimated_cost', 0)),
                safety_notes=data.get('safety_notes', []),
                packaging_marketing_inspiration=data.get('packaging_marketing_inspiration'),
                market_trends=data.get('market_trends'),
                competitive_landscape=data.get('competitive_landscape')
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

def _generate_mock_formulation(req: GenerateRequest) -> GenerateResponse:
    """
    Fallback mock formulation generator with premium pricing.
    """
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
                    price_per_unit=0.25
                ),
                SupplierInfo(
                    name="Clean Water Co.",
                    contact="Phone: +91-87654-32109, Email: sales@cleanwater.co.in",
                    location="Delhi, NCR",
                    price_per_unit=0.35
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
                    price_per_unit=2200.0
                ),
                SupplierInfo(
                    name="Natural Ingredients Ltd",
                    contact="Phone: +91-65432-10987, Email: info@naturalingredients.com",
                    location="Bangalore, Karnataka",
                    price_per_unit=2800.0
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
                    price_per_unit=1800.0
                ),
                SupplierInfo(
                    name="Premium Actives",
                    contact="Phone: +91-43210-98765, Email: sales@premiumactives.com",
                    location="Chennai, Tamil Nadu",
                    price_per_unit=2200.0
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
                    price_per_unit=600.0
                ),
                SupplierInfo(
                    name="Green Chemistry",
                    contact="Phone: +91-21098-76543, Email: info@greenchemistry.com",
                    location="Kolkata, West Bengal",
                    price_per_unit=750.0
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
                    price_per_unit=1400.0
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
                    price_per_unit=900.0
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
                    price_per_unit=400.0
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
                    price_per_unit=750.0
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
                    price_per_unit=300.0
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
                    price_per_unit=200.0
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
            "Store in a cool, dry place away from direct sunlight",
            "Discontinue use if irritation, redness, or discomfort occurs",
            "Keep out of reach of children",
            "Use within 12 months of opening for optimal efficacy"
        ],
        packaging_marketing_inspiration="Premium airless pump bottle with UV protection and gold accents. Consider sustainable packaging with refillable options. Marketing should emphasize 'Science-backed luxury' with focus on visible results, clean ingredients, and dermatologist-recommended formulations.",
        market_trends=[
            "Growing demand for clean, science-backed luxury skincare",
            "Increased focus on ingredient transparency and efficacy",
            "Rising popularity of multi-functional serums with proven actives",
            "Consumers willing to pay premium for visible results and quality"
        ],
        competitive_landscape={
            "price_range": "₹2,500-8,000 per 30ml",
            "target_demographics": "Women aged 25-45 with disposable income seeking premium skincare",
            "distribution_channels": "Luxury department stores, premium beauty retailers, direct-to-consumer",
            "key_competitors": "La Mer, SK-II, Estée Lauder Advanced Night Repair, Drunk Elephant"
        }
    )
