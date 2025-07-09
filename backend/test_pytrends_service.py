import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.pytrends_service import PyTrendsService
from app.services.local_market_size_service import LocalMarketSizeService

async def test_pytrends_service():
    """Test the PyTrends service with real Google Trends data."""
    
    print("🧪 Testing PyTrends Service")
    print("=" * 50)
    
    # Initialize the service
    trends_service = PyTrendsService()
    
    # Test connection
    print("\n🔗 Testing PyTrends Connection...")
    connection_ok = await trends_service.test_connection()
    print(f"✅ Connection Status: {'Success' if connection_ok else 'Failed'}")
    
    if not connection_ok:
        print("⚠️  PyTrends not available, will use fallback data")
    
    # Test single search term
    print("\n🔍 Testing Single Search Term...")
    test_term = "skincare"
    test_location = "IN-MH"  # Maharashtra
    
    single_result = await trends_service.get_trends_data(test_term, test_location)
    if single_result and single_result.get('success'):
        print(f"✅ Successfully fetched data for '{test_term}'")
        print(f"   📊 Search Volume: {single_result['search_volume']}")
        print(f"   📈 Data Points: {single_result.get('data_points', 0)}")
        print(f"   📅 Trend Data Points: {len(single_result['trend_data'])}")
        print(f"   🔧 Source: {single_result.get('source', 'unknown')}")
    else:
        print(f"❌ Failed to fetch data for '{test_term}'")
        if single_result:
            print(f"   Error: {single_result.get('error', 'Unknown error')}")
    
    # Test multiple search terms
    print("\n🔍 Testing Multiple Search Terms...")
    test_terms = ["skincare", "beauty products", "cosmetics"]
    
    multiple_results = await trends_service.get_multiple_trends_data(test_terms, test_location)
    
    successful_terms = 0
    pytrends_terms = 0
    fallback_terms = 0
    
    for term, result in multiple_results.items():
        if result.get('success'):
            successful_terms += 1
            source = result.get('source', 'unknown')
            if source == 'pytrends':
                pytrends_terms += 1
            elif source == 'fallback':
                fallback_terms += 1
            print(f"   ✅ {term}: {result['search_volume']} searches ({source})")
        else:
            print(f"   ❌ {term}: Failed - {result.get('error', 'Unknown error')}")
    
    print(f"\n📊 Success Rate: {successful_terms}/{len(test_terms)} terms")
    print(f"📊 PyTrends Data: {pytrends_terms} terms")
    print(f"📊 Fallback Data: {fallback_terms} terms")
    
    # Test location mapping
    print("\n📍 Testing Location Mapping...")
    test_cities = ["mumbai", "delhi", "bangalore", "pune", "unknown_city"]
    
    for city in test_cities:
        location_code = trends_service.get_location_code(city)
        print(f"   • {city}: {location_code}")
    
    print("\n" + "=" * 50)
    print("✅ PyTrends Service Test Completed!")

async def test_local_market_with_pytrends():
    """Test the local market service with PyTrends data."""
    
    print("\n📊 Testing Local Market Service with PyTrends")
    print("=" * 60)
    
    # Initialize the service
    market_service = LocalMarketSizeService()
    
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
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📊 Test Case {i}: {test_case['category']} in {test_case['location']}")
        print("-" * 50)
        
        try:
            # Perform analysis
            market_data = await market_service.analyze_local_market_size(
                location=test_case['location'],
                category=test_case['category'],
                product_name=test_case['product_name'],
                ingredients=test_case['ingredients']
            )
            
            # Format data for display
            formatted_data = market_service.format_market_data_for_frontend(market_data)
            
            # Display results
            print(f"✅ Analysis completed successfully!")
            print(f"📍 Location: {formatted_data['location']}")
            print(f"💰 Market Size: {formatted_data['market_size']}")
            print(f"👥 Population: {formatted_data['population']}")
            print(f"🌐 Internet Users: {formatted_data['internet_users']}")
            print(f"🎯 Confidence Level: {formatted_data['confidence_level']}")
            print(f"🔍 Search Terms Analyzed: {len(formatted_data['search_terms'])}")
            
            # Check data sources
            pytrends_count = 0
            fallback_count = 0
            
            for term, volume in formatted_data['search_volume'].items():
                if volume > 0:
                    # Check if this was real PyTrends data or fallback
                    # We can't easily determine this from the formatted data,
                    # but we can show the volumes
                    if volume > 5000:  # High volume suggests real data
                        pytrends_count += 1
                    else:
                        fallback_count += 1
            
            print(f"📊 Data Source Analysis:")
            print(f"   • High Volume Terms (likely real data): {pytrends_count}")
            print(f"   • Lower Volume Terms (likely fallback): {fallback_count}")
            
            # Display search volume
            print(f"\n📈 Search Volume Analysis:")
            for term, volume in formatted_data['search_volume'].items():
                if volume > 0:
                    print(f"   • {term}: {volume:,}")
            
        except Exception as e:
            print(f"❌ Test failed: {str(e)}")
    
    print("\n" + "=" * 60)
    print("✅ Local Market Service with PyTrends Test Completed!")

async def main():
    """Run all tests."""
    await test_pytrends_service()
    await test_local_market_with_pytrends()

if __name__ == "__main__":
    asyncio.run(main()) 