import React, { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface MarketResearchProps {
  selectedCategory: string;
  selectedCity?: string;
  localMarketData?: any;
  onCityChange?: (city: string) => void;
  productQuery?: string; // Add product query for dynamic profiling
}

const MarketResearch: React.FC<MarketResearchProps> = ({ 
  selectedCategory, 
  selectedCity = 'Mumbai',
  localMarketData,
  onCityChange,
  productQuery = ''
}) => {
  const [expandedSections, setExpandedSections] = useState<{
    highValue: boolean;
    midValue: boolean;
    entryLevel: boolean;
    revenueProjections: boolean;
    tam: boolean;
    sam: boolean;
    som: boolean;
  }>({
    highValue: false,
    midValue: false,
    entryLevel: false,
    revenueProjections: false,
    tam: false,
    sam: false,
    som: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate customer segments based on local market data
  const calculateCustomerSegments = () => {
    if (!localMarketData) {
      return {
        highValue: { purchasers: '2.4M', aov: '₹2,500 - ₹4,000', revenue: '₹7.2M - ₹15.4M' },
        midValue: { purchasers: '6.0M', aov: '₹1,200 - ₹2,500', revenue: '₹8.6M - ₹24.0M' },
        entryLevel: { purchasers: '3.6M', aov: '₹500 - ₹1,200', revenue: '₹2.2M - ₹6.9M' }
      };
    }

    const actualPurchasers = parseInt(localMarketData.actual_purchasers?.replace(/,/g, '') || '0');
    const avgOrderValue = parseInt(localMarketData.average_order_value?.replace('₹', '').replace(',', '') || '2000');
    
    return {
      highValue: {
        purchasers: `${(actualPurchasers * 0.2 / 1000000).toFixed(1)}M`,
        aov: `₹${avgOrderValue.toLocaleString()}`,
        revenue: `${((actualPurchasers * 0.2 * avgOrderValue) / 1000000).toFixed(1)}M`
      },
      midValue: {
        purchasers: `${(actualPurchasers * 0.5 / 1000000).toFixed(1)}M`,
        aov: `₹${Math.round(avgOrderValue * 0.6).toLocaleString()}`,
        revenue: `${((actualPurchasers * 0.5 * avgOrderValue * 0.6) / 1000000).toFixed(1)}M`
      },
      entryLevel: {
        purchasers: `${(actualPurchasers * 0.3 / 1000000).toFixed(1)}M`,
        aov: `₹${Math.round(avgOrderValue * 0.4).toLocaleString()}`,
        revenue: `${((actualPurchasers * 0.3 * avgOrderValue * 0.4) / 1000000).toFixed(1)}M`
      }
    };
  };

  const segments = calculateCustomerSegments();

  // Calculate TAM, SAM, SOM based on city and category
  const calculateMarketSizes = () => {
    if (!localMarketData) {
      return {
        tam: { marketSize: '₹1,260M', population: '1.4B', growthRate: '8-12%' },
        sam: { marketSize: '₹189M', penetration: '15%', accessibility: '85%' },
        som: { marketSize: '₹7.6M', marketShare: '4%', efficiency: '75%' }
      };
    }

    // City population data (in millions)
    const cityPopulations = {
      'Mumbai': 20.4,
      'Delhi': 16.8,
      'Bangalore': 12.4,
      'Hyderabad': 10.5,
      'Chennai': 11.5,
      'Kolkata': 14.9,
      'Pune': 6.5,
      'Ahmedabad': 7.2,
      'Surat': 6.8,
      'Jaipur': 3.5
    };

    // Category multipliers for national extrapolation
    const categoryMultipliers = {
      'cosmetics': 1.2,
      'pet food': 0.8,
      'wellness': 1.1,
      'beverages': 1.3,
      'textiles': 0.9,
      'desi masala': 1.4
    };

    // Market penetration rates by category
    const penetrationRates = {
      'cosmetics': { min: 15, max: 25 },
      'pet food': { min: 8, max: 12 },
      'wellness': { min: 12, max: 18 },
      'beverages': { min: 20, max: 30 },
      'textiles': { min: 10, max: 15 },
      'desi masala': { min: 25, max: 35 }
    };

    const cityPopulation = cityPopulations[selectedCity as keyof typeof cityPopulations] || 20.4;
    const nationalPopulation = 1400; // 1.4B in millions
    const categoryMultiplier = categoryMultipliers[selectedCategory?.toLowerCase() as keyof typeof categoryMultipliers] || 1.0;
    const penetration = penetrationRates[selectedCategory?.toLowerCase() as keyof typeof penetrationRates] || { min: 15, max: 25 };

    // Extract local market size in millions
    const localMarketSize = parseInt(localMarketData.market_size?.replace(/[₹,]/g, '') || '0') / 1000000;
    
    // FIXED LOGIC: Start with TAM and work down
    // TAM = National market size for the category
    const tam = localMarketSize * (nationalPopulation / cityPopulation) * categoryMultiplier;
    
    // SAM = Realistically addressable portion (average penetration rate)
    const avgPenetration = (penetration.min + penetration.max) / 2 / 100;
    const sam = tam * avgPenetration * 0.85; // 85% accessibility factor
    
    // SOM = Achievable market for new entrants (4% of SAM)
    const som = sam * 0.04 * 0.75; // 4% market share, 75% efficiency

    // Validate that local market size is smaller than SOM
    // If local market is larger than SOM, adjust SOM to be 1.5x local market
    // This ensures logical progression: TAM > SAM > SOM > Local Market
    const adjustedSom = Math.max(som, localMarketSize * 1.5);
    
    // Additional validation: Ensure SAM is not smaller than local market
    const adjustedSam = Math.max(sam, localMarketSize * 3); // SAM should be at least 3x local market

    return {
      tam: { 
        marketSize: `${tam.toFixed(1)}M`, 
        population: '1.4B', 
        growthRate: '8-12%' 
      },
      sam: { 
        marketSize: `${adjustedSam.toFixed(1)}M`, 
        penetration: `${avgPenetration * 100}%`, 
        accessibility: '85%' 
      },
      som: { 
        marketSize: `${adjustedSom.toFixed(1)}M`, 
        marketShare: '4%', 
        efficiency: '75%' 
      }
    };
  };

  const marketSizes = calculateMarketSizes();

  const getDynamicCustomerProfiles = () => {
    // Analyze product query for specific characteristics
    const query = productQuery.toLowerCase();
    const category = selectedCategory?.toLowerCase() || '';
    
    // Extract product characteristics from query
    const isPremium = query.includes('premium') || query.includes('luxury') || query.includes('high-end');
    const isNatural = query.includes('natural') || query.includes('organic') || query.includes('herbal');
    const isFunctional = query.includes('functional') || query.includes('health') || query.includes('wellness');
    const isTraditional = query.includes('traditional') || query.includes('desi') || query.includes('authentic');
    const isSustainable = query.includes('sustainable') || query.includes('eco') || query.includes('green');
    const isConvenient = query.includes('convenient') || query.includes('easy') || query.includes('quick');
    const isTargeted = query.includes('senior') || query.includes('young') || query.includes('women') || query.includes('men');
    
    // Base profiles by category
    const baseProfiles = {
      'cosmetics': {
        highValue: 'Beauty enthusiasts, premium seekers, high disposable income, brand conscious',
        midValue: 'Beauty-conscious individuals, value seekers, moderate income, quality focused',
        entryLevel: 'Price-sensitive beauty seekers, trial seekers, lower income, basic needs'
      },
      'pet food': {
        highValue: 'Premium pet parents, brand loyal, high disposable income, pet humanization trend',
        midValue: 'Value-conscious pet owners, quality seekers, moderate income, responsible pet care',
        entryLevel: 'Price-sensitive pet owners, trial seekers, lower income, basic pet needs'
      },
      'wellness': {
        highValue: 'Health-focused professionals, quality conscious, high disposable income, preventive care',
        midValue: 'Health-conscious individuals, value seekers, moderate income, wellness aware',
        entryLevel: 'Price-sensitive health seekers, trial seekers, lower income, basic health needs'
      },
      'beverages': {
        highValue: 'Health-conscious urban professionals, convenience seekers, moderate-high income, lifestyle focused',
        midValue: 'Health-conscious individuals, convenience seekers, moderate income, functional benefits',
        entryLevel: 'Price-sensitive consumers, convenience seekers, lower income, basic hydration'
      },
      'textiles': {
        highValue: 'Fashion-forward professionals, sustainability conscious, high disposable income, trend setters',
        midValue: 'Fashion-conscious individuals, value seekers, moderate income, style aware',
        entryLevel: 'Price-sensitive consumers, basic needs, lower income, functional clothing'
      },
      'desi masala': {
        highValue: 'Traditional food enthusiasts, quality conscious, moderate-high income, authentic seekers',
        midValue: 'Traditional food lovers, value seekers, moderate income, cultural connection',
        entryLevel: 'Price-sensitive consumers, basic needs, lower income, essential cooking'
      }
    };

    let profiles = baseProfiles[category as keyof typeof baseProfiles] || baseProfiles['wellness'];

    // Enhance profiles based on product characteristics
    if (isPremium) {
      profiles.highValue += ', luxury market, exclusive positioning';
      profiles.midValue += ', aspirational consumers, premium value seekers';
      profiles.entryLevel += ', premium trial seekers, aspirational buyers';
    }

    if (isNatural) {
      profiles.highValue += ', organic lifestyle, natural product advocates';
      profiles.midValue += ', health-conscious, natural ingredient seekers';
      profiles.entryLevel += ', natural product curious, health aware';
    }

    if (isFunctional) {
      profiles.highValue += ', performance focused, functional benefits seekers';
      profiles.midValue += ', benefit conscious, functional value seekers';
      profiles.entryLevel += ', functional need driven, benefit aware';
    }

    if (isTraditional) {
      profiles.highValue += ', cultural enthusiasts, traditional value seekers';
      profiles.midValue += ', cultural connection, traditional value';
      profiles.entryLevel += ', traditional needs, cultural basics';
    }

    if (isSustainable) {
      profiles.highValue += ', environmental conscious, sustainability advocates';
      profiles.midValue += ', eco-aware, sustainable value seekers';
      profiles.entryLevel += ', environmental curious, sustainable basics';
    }

    if (isConvenient) {
      profiles.highValue += ', convenience seekers, time-conscious professionals';
      profiles.midValue += ', convenience value, time-efficient seekers';
      profiles.entryLevel += ', convenience driven, time-saving needs';
    }

    if (isTargeted) {
      if (query.includes('senior')) {
        profiles.highValue += ', mature consumers, senior care focused';
        profiles.midValue += ', senior health conscious, mature value seekers';
        profiles.entryLevel += ', senior basic needs, mature consumers';
      }
      if (query.includes('young') || query.includes('millennial')) {
        profiles.highValue += ', millennial professionals, trend-conscious';
        profiles.midValue += ', young professionals, trend-aware';
        profiles.entryLevel += ', young consumers, trend curious';
      }
      if (query.includes('women')) {
        profiles.highValue += ', women-focused, female empowerment';
        profiles.midValue += ', women-conscious, female value seekers';
        profiles.entryLevel += ', women basic needs, female consumers';
      }
      if (query.includes('men')) {
        profiles.highValue += ', men-focused, male grooming conscious';
        profiles.midValue += ', men-conscious, male value seekers';
        profiles.entryLevel += ', men basic needs, male consumers';
      }
    }

    // Add city-specific characteristics
    const cityCharacteristics = {
      'Mumbai': 'urban professionals, cosmopolitan lifestyle',
      'Delhi': 'government professionals, traditional-modern mix',
      'Bangalore': 'tech professionals, startup culture',
      'Hyderabad': 'IT professionals, traditional values',
      'Chennai': 'conservative professionals, traditional lifestyle',
      'Kolkata': 'intellectual professionals, cultural heritage',
      'Pune': 'educational professionals, balanced lifestyle',
      'Ahmedabad': 'business professionals, traditional business values',
      'Surat': 'business professionals, diamond trade culture',
      'Jaipur': 'heritage conscious, traditional royal culture'
    };

    const cityChar = cityCharacteristics[selectedCity as keyof typeof cityCharacteristics] || 'urban professionals';
    profiles.highValue += `, ${cityChar}`;
    profiles.midValue += `, ${cityChar}`;
    profiles.entryLevel += `, ${cityChar}`;

    return profiles;
  };

  const categoryInsights = getDynamicCustomerProfiles();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Customer Segments & Market Analysis
            </h3>
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">Target City:</label>
              <select
                value={selectedCity}
                onChange={(e) => onCityChange?.(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Pune">Pune</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Surat">Surat</option>
                <option value="Jaipur">Jaipur</option>
              </select>
            </div>
          </div>
          {localMarketData && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Location:</span> {selectedCity} | 
                <span className="font-semibold"> Market Size:</span> {`₹${(parseInt(localMarketData.market_size?.replace(/[₹,]/g, '') || '0') / 1000000).toFixed(1)}M`} | 
                <span className="font-semibold"> Total Purchasers:</span> {`${(parseInt(localMarketData.actual_purchasers?.replace(/[,]/g, '') || '0') / 1000000).toFixed(1)}M`}
              </p>
            </div>
          )}
        </div>

        {/* High-Value Customers */}
        <div className="border-t border-gray-200">
          <button
            onClick={() => toggleSection('highValue')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold text-purple-800">High-Value Customers (20%)</h4>
                <p className="text-sm text-gray-600">{segments.highValue.purchasers} purchasers</p>
              </div>
            </div>
            {expandedSections.highValue ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.highValue && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-600 font-medium">Prospective Purchasers</p>
                  <p className="text-lg font-bold text-purple-800">{segments.highValue.purchasers}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-600 font-medium">Average Order Value</p>
                  <p className="text-lg font-bold text-purple-800">{segments.highValue.aov}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-purple-600 font-medium">Annual Revenue Potential</p>
                  <p className="text-lg font-bold text-purple-800">{segments.highValue.revenue}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Profile:</span> {categoryInsights.highValue}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mid-Value Customers */}
        <div className="border-t border-gray-200">
          <button
            onClick={() => toggleSection('midValue')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold text-blue-800">Mid-Value Customers (50%)</h4>
                <p className="text-sm text-gray-600">{segments.midValue.purchasers} purchasers</p>
              </div>
            </div>
            {expandedSections.midValue ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.midValue && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">Prospective Purchasers</p>
                  <p className="text-lg font-bold text-blue-800">{segments.midValue.purchasers}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">Average Order Value</p>
                  <p className="text-lg font-bold text-blue-800">{segments.midValue.aov}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">Annual Revenue Potential</p>
                  <p className="text-lg font-bold text-blue-800">{segments.midValue.revenue}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Profile:</span> {categoryInsights.midValue}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Entry-Level Customers */}
        <div className="border-t border-gray-200">
          <button
            onClick={() => toggleSection('entryLevel')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold text-green-800">Entry-Level Customers (30%)</h4>
                <p className="text-sm text-gray-600">{segments.entryLevel.purchasers} purchasers</p>
              </div>
            </div>
            {expandedSections.entryLevel ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.entryLevel && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">Prospective Purchasers</p>
                  <p className="text-lg font-bold text-green-800">{segments.entryLevel.purchasers}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">Average Order Value</p>
                  <p className="text-lg font-bold text-green-800">{segments.entryLevel.aov}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600 font-medium">Annual Revenue Potential</p>
                  <p className="text-lg font-bold text-green-800">{segments.entryLevel.revenue}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Profile:</span> {categoryInsights.entryLevel}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Projections Summary */}
        <div className="border-t border-gray-200">
          <button
            onClick={() => toggleSection('revenueProjections')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold text-gray-800">Revenue Projections Summary</h4>
                <p className="text-sm text-gray-600">Total market potential</p>
              </div>
            </div>
            {expandedSections.revenueProjections ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.revenueProjections && (
            <div className="px-4 pb-4">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Market Size</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {localMarketData ? 
                        `${(parseInt(localMarketData.market_size?.replace(/[₹,]/g, '') || '0') / 1000000).toFixed(1)}M` : 
                        '₹18.0M - ₹46.3M'
                      }
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Purchasers</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {localMarketData ? 
                        `${(parseInt(localMarketData.actual_purchasers?.replace(/[,]/g, '') || '0') / 1000000).toFixed(1)}M` : 
                        '12.0M - 16.0M'
                      }
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-purple-600 font-medium">High-Value (20%):</span>
                    <span className="font-semibold">{segments.highValue.revenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-600 font-medium">Mid-Value (50%):</span>
                    <span className="font-semibold">{segments.midValue.revenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-600 font-medium">Entry-Level (30%):</span>
                    <span className="font-semibold">{segments.entryLevel.revenue}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TAM (Total Addressable Market) */}
        <div className="border-t border-gray-200">
          <button
            onClick={() => toggleSection('tam')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold text-indigo-800">TAM (Total Addressable Market)</h4>
                <p className="text-sm text-gray-600">₹{marketSizes.tam.marketSize} market size</p>
              </div>
            </div>
            {expandedSections.tam ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.tam && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-indigo-600 font-medium">Market Size</p>
                  <p className="text-lg font-bold text-indigo-800">₹{marketSizes.tam.marketSize}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-indigo-600 font-medium">Population</p>
                  <p className="text-lg font-bold text-indigo-800">{marketSizes.tam.population}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-indigo-600 font-medium">Growth Rate</p>
                  <p className="text-lg font-bold text-indigo-800">{marketSizes.tam.growthRate}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Definition:</span> Total market demand for this product category across India, calculated by extrapolating local market data to national scale with category-specific multipliers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SAM (Serviceable Available Market) */}
        <div className="border-t border-gray-200">
          <button
            onClick={() => toggleSection('sam')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold text-teal-800">SAM (Serviceable Available Market)</h4>
                <p className="text-sm text-gray-600">₹{marketSizes.sam.marketSize} market size</p>
              </div>
            </div>
            {expandedSections.sam ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.sam && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-teal-50 p-3 rounded-lg">
                  <p className="text-xs text-teal-600 font-medium">Market Size</p>
                  <p className="text-lg font-bold text-teal-800">₹{marketSizes.sam.marketSize}</p>
                </div>
                <div className="bg-teal-50 p-3 rounded-lg">
                  <p className="text-xs text-teal-600 font-medium">Penetration</p>
                  <p className="text-lg font-bold text-teal-800">{marketSizes.sam.penetration}</p>
                </div>
                <div className="bg-teal-50 p-3 rounded-lg">
                  <p className="text-xs text-teal-600 font-medium">Accessibility</p>
                  <p className="text-lg font-bold text-teal-800">{marketSizes.sam.accessibility}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Definition:</span> Portion of TAM that can be realistically reached with current market penetration and accessibility constraints, accounting for category-specific adoption rates.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SOM (Serviceable Obtainable Market) */}
        <div className="border-t border-gray-200">
          <button
            onClick={() => toggleSection('som')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <div>
                <h4 className="font-semibold text-orange-800">SOM (Serviceable Obtainable Market)</h4>
                <p className="text-sm text-gray-600">₹{marketSizes.som.marketSize} market size</p>
              </div>
            </div>
            {expandedSections.som ? (
              <ChevronUpIcon className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {expandedSections.som && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-orange-600 font-medium">Market Size</p>
                  <p className="text-lg font-bold text-orange-800">₹{marketSizes.som.marketSize}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-orange-600 font-medium">Market Share</p>
                  <p className="text-lg font-bold text-orange-800">{marketSizes.som.marketShare}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-orange-600 font-medium">Efficiency</p>
                  <p className="text-lg font-bold text-orange-800">{marketSizes.som.efficiency}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Definition:</span> Realistic market opportunity achievable within 3-5 years, considering competitive landscape, operational efficiency, and realistic market share potential for new entrants.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Market Size Progression Summary */}
        <div className="border-t border-gray-200">
          <div className="px-4 py-3">
            <h4 className="font-semibold text-gray-800 mb-3">Market Size Progression</h4>
            <div className="mb-3 p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-800">
                <span className="font-medium">Market Logic:</span> TAM (Total Addressable Market) &gt; SAM (Serviceable Available Market) &gt; SOM (Serviceable Obtainable Market) &gt; Local Market Size. This ensures realistic market sizing where local markets are subsets of achievable opportunities.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <h6 className="font-semibold text-indigo-800 mb-1">TAM</h6>
                <p className="font-bold text-lg text-indigo-600">₹{marketSizes.tam.marketSize}</p>
                <p className="text-xs text-indigo-600">Total Addressable Market</p>
              </div>
              <div className="text-center p-3 bg-teal-50 rounded-lg">
                <h6 className="font-semibold text-teal-800 mb-1">SAM</h6>
                <p className="font-bold text-lg text-teal-600">₹{marketSizes.sam.marketSize}</p>
                <p className="text-xs text-teal-600">Serviceable Available Market</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <h6 className="font-semibold text-orange-800 mb-1">SOM</h6>
                <p className="font-bold text-lg text-orange-600">₹{marketSizes.som.marketSize}</p>
                <p className="text-xs text-orange-600">Serviceable Obtainable Market</p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                <span className="font-medium">Market Funnel:</span> TAM represents total market potential, SAM shows realistically addressable market, and SOM indicates achievable opportunity for new entrants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketResearch; 