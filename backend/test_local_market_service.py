import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.local_market_size_service import LocalMarketSizeService

async def test_local_market_analysis():
    """Test the local market size analysis functionality."""
    
    print("🧪 Testing Local Market Size Service")
    print("=" * 50)
    
    # Initialize the service
    service = LocalMarketSizeService()
    
    # Test cases
    test_cases = [
        {
            "location": "mumbai",
            "category": "cosmetics",
            "product_name": "Premium Anti-Aging Serum",
            "ingredients": ["hyaluronic acid", "vitamin c", "peptides"]
        },
        {
            "location": "bangalore",
            "category": "pet food",
            "product_name": "Premium Dog Food",
            "ingredients": ["chicken", "rice", "vegetables"]
        },
        {
            "location": "delhi",
            "category": "wellness",
            "product_name": "Immunity Booster",
            "ingredients": ["vitamin c", "zinc", "elderberry"]
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📊 Test Case {i}: {test_case['category']} in {test_case['location']}")
        print("-" * 40)
        
        try:
            # Perform analysis
            market_data = await service.analyze_local_market_size(
                location=test_case['location'],
                category=test_case['category'],
                product_name=test_case['product_name'],
                ingredients=test_case['ingredients']
            )
            
            # Format data for display
            formatted_data = service.format_market_data_for_frontend(market_data)
            
            # Display results
            print(f"✅ Analysis completed successfully!")
            print(f"📍 Location: {formatted_data['location']}")
            print(f"💰 Market Size: {formatted_data['market_size']}")
            print(f"👥 Population: {formatted_data['population']}")
            print(f"🌐 Internet Users: {formatted_data['internet_users']}")
            print(f"🎯 Confidence Level: {formatted_data['confidence_level']}")
            print(f"🔍 Search Terms Analyzed: {len(formatted_data['search_terms'])}")
            print(f"📊 Data Sources: {len(formatted_data['data_sources'])}")
            
            # Display search volume
            print(f"\n📈 Search Volume Analysis:")
            for term, volume in formatted_data['search_volume'].items():
                print(f"  • {term}: {volume:,}")
            
            # Display methodology
            print(f"\n📋 Methodology:")
            print(formatted_data['methodology'][:200] + "...")
            
            # Display assumptions
            print(f"\n💭 Key Assumptions:")
            for assumption in formatted_data['assumptions'][:3]:
                print(f"  • {assumption}")
            
        except Exception as e:
            print(f"❌ Test failed: {str(e)}")
    
    print("\n" + "=" * 50)
    print("✅ Local Market Size Service Test Completed!")

async def test_service_methods():
    """Test individual service methods."""
    
    print("\n🔧 Testing Service Methods")
    print("=" * 30)
    
    service = LocalMarketSizeService()
    
    # Test population data retrieval
    print("\n📍 Testing Population Data:")
    test_locations = ["mumbai", "delhi", "bangalore", "pune", "unknown_city"]
    
    for location in test_locations:
        population, internet_penetration = service._get_population_data(location)
        city_tier = service._determine_city_tier(location)
        print(f"  • {location}: {population:,} people, {internet_penetration:.1%} internet, {city_tier}")
    
    # Test search volume calculation
    print("\n🔍 Testing Search Volume Calculation:")
    test_terms = ["skincare", "pet food", "supplements", "unknown_term"]
    test_location = "mumbai"
    test_category = "cosmetics"
    
    for term in test_terms:
        volume = service._calculate_base_volume(term, test_location, test_category)
        print(f"  • {term}: {volume:,} searches")
    
    # Test category configurations
    print("\n📊 Testing Category Configurations:")
    for category, config in service.category_search_terms.items():
        print(f"  • {category}: {len(config['primary_terms'])} primary terms, {len(config['secondary_terms'])} secondary terms")
    
    print("\n✅ Service Methods Test Completed!")

if __name__ == "__main__":
    # Run the tests
    asyncio.run(test_local_market_analysis())
    asyncio.run(test_service_methods()) 