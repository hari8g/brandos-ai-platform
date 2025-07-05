from app.models.branding import BrandingStrategy, BrandNameSuggestion, SocialMediaChannel, BrandingRequest
from app.models.generate import GenerateResponse
from typing import List, Dict

def generate_brand_name_suggestions(formulation: GenerateResponse, brand_tone: str) -> List[BrandNameSuggestion]:
    """
    Generate brand name suggestions based on the formulation and brand tone.
    """
    product_name = formulation["product_name"] if isinstance(formulation, dict) else formulation.product_name
    if isinstance(formulation, dict):
        category = formulation.get('category', 'general')
    else:
        category = getattr(formulation, 'category', 'general')
    
    # Debug: Print category detection
    print(f"DEBUG: Detected category: '{category}' from formulation")
    print(f"DEBUG: Formulation keys: {formulation.keys() if isinstance(formulation, dict) else (formulation.__dict__.keys() if hasattr(formulation, '__dict__') else 'No __dict__')}")
    
    # Brand name suggestions based on category and tone
    suggestions = []
    
    if category == "pet food":
        suggestions = [
            BrandNameSuggestion(
                name="Pawsome",
                meaning="Combination of 'Paws' and 'Awesome'",
                category=brand_tone,
                reasoning="Perfect for pet food as it's playful and memorable",
                availability_check="High availability for trademark registration"
            ),
            BrandNameSuggestion(
                name="NutriPaws",
                meaning="Nutrition + Paws",
                category=brand_tone,
                reasoning="Emphasizes nutrition and pet care",
                availability_check="Good availability, descriptive but distinctive"
            ),
            BrandNameSuggestion(
                name="VitalBites",
                meaning="Vital nutrition in bite-sized portions",
                category=brand_tone,
                reasoning="Suggests health and nutrition benefits",
                availability_check="Moderate availability, health-focused"
            )
        ]
    elif category == "wellness":
        suggestions = [
            BrandNameSuggestion(
                name="VitaFlow",
                meaning="Vitality + Flow of wellness",
                category=brand_tone,
                reasoning="Suggests natural flow of wellness and vitality",
                availability_check="Good availability, wellness-focused"
            ),
            BrandNameSuggestion(
                name="PureEssence",
                meaning="Pure essence of natural ingredients",
                category=brand_tone,
                reasoning="Emphasizes purity and natural ingredients",
                availability_check="Moderate availability, premium positioning"
            ),
            BrandNameSuggestion(
                name="WellCore",
                meaning="Core of wellness",
                category=brand_tone,
                reasoning="Suggests fundamental wellness benefits",
                availability_check="High availability, modern and clean"
            )
        ]
    elif category == "cosmetics":
        suggestions = [
            BrandNameSuggestion(
                name="GlowCraft",
                meaning="Crafting natural glow",
                category=brand_tone,
                reasoning="Suggests artisanal approach to beauty",
                availability_check="Good availability, beauty-focused"
            ),
            BrandNameSuggestion(
                name="PureGlow",
                meaning="Pure natural glow",
                category=brand_tone,
                reasoning="Emphasizes natural beauty and radiance",
                availability_check="Moderate availability, clean beauty"
            ),
            BrandNameSuggestion(
                name="VitaBeauty",
                meaning="Vitality + Beauty",
                category=brand_tone,
                reasoning="Combines health and beauty benefits",
                availability_check="High availability, wellness-beauty crossover"
            )
        ]
    else:
        # Generic suggestions
        suggestions = [
            BrandNameSuggestion(
                name="VitaCraft",
                meaning="Crafting vitality",
                category=brand_tone,
                reasoning="Suggests artisanal approach to health",
                availability_check="Good availability, versatile"
            ),
            BrandNameSuggestion(
                name="PureEssence",
                meaning="Pure essence of natural ingredients",
                category=brand_tone,
                reasoning="Emphasizes purity and natural ingredients",
                availability_check="Moderate availability, premium positioning"
            ),
            BrandNameSuggestion(
                name="WellCraft",
                meaning="Crafting wellness",
                category=brand_tone,
                reasoning="Suggests artisanal approach to wellness",
                availability_check="High availability, wellness-focused"
            )
        ]
    
    return suggestions

def generate_social_media_channels(formulation: GenerateResponse) -> List[SocialMediaChannel]:
    """
    Generate social media channel strategies for the formulation.
    """
    if isinstance(formulation, dict):
        category = formulation.get('category', 'general')
    else:
        category = getattr(formulation, 'category', 'general')
    
    channels = []
    
    # Instagram Strategy
    instagram_content = [
        "Behind-the-scenes manufacturing process",
        "Ingredient spotlight posts",
        "Customer testimonials and reviews",
        "Educational content about benefits",
        "Lifestyle shots with the product",
        "Before/after results",
        "Expert endorsements"
    ]
    
    instagram_hashtags = [
        "#NaturalProducts", "#WellnessJourney", "#HealthyLiving",
        "#CleanBeauty", "#PetCare", "#OrganicLiving",
        "#SustainableLiving", "#HealthFirst", "#QualityProducts"
    ]
    
    instagram_tips = [
        "Post consistently 3-4 times per week",
        "Use high-quality visuals and videos",
        "Engage with followers through stories",
        "Collaborate with influencers in your niche",
        "Share user-generated content"
    ]
    
    channels.append(SocialMediaChannel(
        platform="Instagram",
        content_strategy="Visual storytelling with focus on lifestyle and benefits",
        target_audience="Health-conscious consumers aged 25-45",
        post_frequency="3-4 times per week",
        content_ideas=instagram_content,
        hashtag_strategy=instagram_hashtags,
        engagement_tips=instagram_tips
    ))
    
    # TikTok Strategy
    tiktok_content = [
        "Quick ingredient facts",
        "Manufacturing process videos",
        "Before/after transformations",
        "Customer testimonials",
        "Expert tips and advice",
        "Product demonstrations",
        "Trending challenges with your product"
    ]
    
    tiktok_hashtags = [
        "#WellnessTok", "#HealthTips", "#NaturalProducts",
        "#PetCare", "#BeautyRoutine", "#HealthyLiving",
        "#ProductDemo", "#CustomerReview"
    ]
    
    tiktok_tips = [
        "Create short, engaging videos (15-60 seconds)",
        "Jump on trending challenges",
        "Use popular music and effects",
        "Collaborate with TikTok creators",
        "Post 1-2 times daily"
    ]
    
    channels.append(SocialMediaChannel(
        platform="TikTok",
        content_strategy="Short-form educational and entertaining content",
        target_audience="Young consumers aged 18-35",
        post_frequency="1-2 times daily",
        content_ideas=tiktok_content,
        hashtag_strategy=tiktok_hashtags,
        engagement_tips=tiktok_tips
    ))
    
    # YouTube Strategy
    youtube_content = [
        "Detailed product reviews and demonstrations",
        "Expert interviews and collaborations",
        "Manufacturing process documentaries",
        "Customer success stories",
        "Educational content about ingredients",
        "Comparison videos with competitors",
        "Behind-the-scenes content"
    ]
    
    youtube_hashtags = [
        "#NaturalProducts", "#WellnessJourney", "#ProductReview",
        "#HealthyLiving", "#CleanBeauty", "#PetCare",
        "#ManufacturingProcess", "#CustomerStories"
    ]
    
    youtube_tips = [
        "Upload 1-2 videos per week",
        "Create detailed, informative content",
        "Optimize titles and descriptions for SEO",
        "Collaborate with YouTube influencers",
        "Use end screens and cards for engagement"
    ]
    
    channels.append(SocialMediaChannel(
        platform="YouTube",
        content_strategy="Long-form educational and review content",
        target_audience="Detailed-oriented consumers aged 25-50",
        post_frequency="1-2 times per week",
        content_ideas=youtube_content,
        hashtag_strategy=youtube_hashtags,
        engagement_tips=youtube_tips
    ))
    
    # LinkedIn Strategy
    linkedin_content = [
        "Industry insights and trends",
        "Company culture and values",
        "Expert opinions and thought leadership",
        "Product development stories",
        "Sustainability initiatives",
        "Partnership announcements",
        "Industry event participation"
    ]
    
    linkedin_hashtags = [
        "#NaturalProducts", "#WellnessIndustry", "#Sustainability",
        "#Innovation", "#QualityAssurance", "#HealthTech",
        "#Manufacturing", "#BusinessGrowth"
    ]
    
    linkedin_tips = [
        "Post 2-3 times per week",
        "Share industry insights and thought leadership",
        "Engage with professional network",
        "Use professional tone and language",
        "Connect with industry leaders"
    ]
    
    channels.append(SocialMediaChannel(
        platform="LinkedIn",
        content_strategy="Professional content focused on industry insights",
        target_audience="B2B customers and industry professionals",
        post_frequency="2-3 times per week",
        content_ideas=linkedin_content,
        hashtag_strategy=linkedin_hashtags,
        engagement_tips=linkedin_tips
    ))
    
    return channels

def generate_branding_strategy(request: BrandingRequest) -> BrandingStrategy:
    """
    Generate comprehensive branding strategy for the formulation.
    """
    formulation = request.formulation
    brand_tone = request.brand_tone or "modern"
    
    # Generate brand name suggestions
    brand_name_suggestions = generate_brand_name_suggestions(formulation, brand_tone)
    
    # Generate social media channels
    social_media_channels = generate_social_media_channels(formulation)
    
    # Determine overall branding theme
    category = formulation.category if hasattr(formulation, 'category') else 'general'
    
    if category == "pet food":
        overall_theme = "Trust, Care, and Quality - Building a brand that pet parents can rely on for their furry family members"
        brand_personality = "Caring, trustworthy, and playful - like a loving pet parent"
    elif category == "wellness":
        overall_theme = "Natural Wellness and Vitality - Empowering individuals to take control of their health naturally"
        brand_personality = "Authentic, knowledgeable, and supportive - like a trusted wellness coach"
    elif category == "cosmetics":
        overall_theme = "Natural Beauty and Self-Care - Enhancing natural beauty with clean, effective ingredients"
        brand_personality = "Confident, nurturing, and empowering - like a beauty expert who cares"
    else:
        overall_theme = "Quality and Trust - Delivering premium products that customers can rely on"
        brand_personality = "Reliable, innovative, and customer-focused"
    
    # Visual identity guidelines
    visual_guidelines = [
        "Use natural, earthy color palettes",
        "Incorporate clean, minimalist design elements",
        "Feature high-quality product photography",
        "Use typography that conveys trust and quality",
        "Include ingredient-focused imagery",
        "Maintain consistent brand colors across all platforms"
    ]
    
    # Marketing messaging
    marketing_messages = [
        "Emphasize natural ingredients and quality",
        "Highlight health and wellness benefits",
        "Share customer success stories",
        "Educate about ingredients and processes",
        "Build trust through transparency",
        "Create emotional connections with target audience"
    ]
    
    return BrandingStrategy(
        brand_name_suggestions=brand_name_suggestions,
        social_media_channels=social_media_channels,
        overall_branding_theme=overall_theme,
        brand_personality=brand_personality,
        visual_identity_guidelines=visual_guidelines,
        marketing_messaging=marketing_messages
    )

def analyze_branding(request: BrandingRequest) -> BrandingStrategy:
    """
    Analyze branding opportunities for the formulation.
    """
    return generate_branding_strategy(request) 