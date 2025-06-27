#!/usr/bin/env python3
"""
Test script to verify API functions work locally
"""
import json
import sys
import os

# Add the api directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'api'))

from index import assess_query_quality_simple, generate_formulation_simple

def test_assess_query_quality():
    """Test the query quality assessment function"""
    print("🧪 Testing query quality assessment...")
    
    test_cases = [
        "I need a serum for acne",
        "Create a moisturizer for dry skin",
        "test"
    ]
    
    for query in test_cases:
        try:
            result = assess_query_quality_simple(query)
            print(f"✅ Query: '{query}' -> Score: {result['score']}/7")
            print(f"   Feedback: {result['feedback']}")
            print(f"   Needs improvement: {result['needs_improvement']}")
            print()
        except Exception as e:
            print(f"❌ Error with query '{query}': {e}")
            return False
    
    return True

def test_generate_formulation():
    """Test the formulation generation function"""
    print("🧪 Testing formulation generation...")
    
    test_cases = [
        ("I need a serum for acne", "Skincare", "Mumbai"),
        ("Create a moisturizer for dry skin", "Skincare", "Delhi"),
        ("test", "General", "India")
    ]
    
    for query, category, location in test_cases:
        try:
            result = generate_formulation_simple(query, category, location)
            print(f"✅ Query: '{query}' -> Product: {result['product_name']}")
            print(f"   Cost: ₹{result['estimated_cost']}")
            print(f"   Ingredients: {len(result['ingredients'])} items")
            print()
        except Exception as e:
            print(f"❌ Error with query '{query}': {e}")
            return False
    
    return True

def main():
    """Run all tests"""
    print("🚀 Starting API function tests...\n")
    
    # Test query quality assessment
    if not test_assess_query_quality():
        print("❌ Query quality assessment tests failed!")
        return 1
    
    # Test formulation generation
    if not test_generate_formulation():
        print("❌ Formulation generation tests failed!")
        return 1
    
    print("✅ All tests passed! API functions work correctly.")
    return 0

if __name__ == "__main__":
    exit(main()) 