import React, { useState, useEffect } from 'react';
import { getCategoryColors } from '@/lib/colorUtils';

interface Ingredient {
  name: string;
  amount?: string;
  percent?: number;
  percentage?: number;
  cost_per_100ml?: number;
  why_chosen?: string;
  suppliers?: any[];
}

interface PriorityScore {
  axis: string;
  score: number;
  description: string;
}

interface IngredientListProps {
  ingredients: Ingredient[];
  selectedCategory?: string | null;
}

export default function IngredientList({ ingredients, selectedCategory }: IngredientListProps) {
  const colors = getCategoryColors(selectedCategory || null);
  const [priorityScores, setPriorityScores] = useState<PriorityScore[]>([]);

  // Calculate priority scores based on ingredients and category
  useEffect(() => {
    const calculatePriorities = () => {
      const scores: PriorityScore[] = [
        {
          axis: 'Efficacy',
          score: calculateEfficacyScore(),
          description: getEfficacyDescription()
        },
        {
          axis: 'Cost-effectiveness',
          score: calculateCostEffectivenessScore(),
          description: getCostEffectivenessDescription()
        },
        {
          axis: 'Compliance',
          score: calculateComplianceScore(),
          description: getComplianceDescription()
        },
        {
          axis: 'Consumer Appeal',
          score: calculateConsumerAppealScore(),
          description: getConsumerAppealDescription()
        },
        {
          axis: 'Sustainability',
          score: calculateSustainabilityScore(),
          description: getSustainabilityDescription()
        }
      ];
      setPriorityScores(scores);
    };

    calculatePriorities();
  }, [ingredients, selectedCategory]);

  const calculateEfficacyScore = (): number => {
    if (!ingredients.length) return 0;
    
    // Score based on ingredient quality, active ingredients, and formulation balance
    let score = 0;
    const totalIngredients = ingredients.length;
    
    ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase();
      const why = ingredient.why_chosen?.toLowerCase() || '';
      
      // High-efficacy ingredients
      if (name.includes('active') || name.includes('peptide') || name.includes('retinol') || 
          name.includes('vitamin') || name.includes('antioxidant') || name.includes('extract')) {
        score += 20;
      }
      
      // Efficacy mentions in reasoning
      if (why.includes('efficacy') || why.includes('effective') || why.includes('results') || 
          why.includes('benefit') || why.includes('performance')) {
        score += 15;
      }
      
      // Balanced formulation
      if (ingredient.percent && ingredient.percent > 0 && ingredient.percent < 30) {
        score += 10;
      }
    });
    
    return Math.min(100, Math.max(0, score / totalIngredients));
  };

  const calculateCostEffectivenessScore = (): number => {
    if (!ingredients.length) return 0;
    
    let totalCost = 0;
    let ingredientCount = 0;
    
    ingredients.forEach(ingredient => {
      if (ingredient.cost_per_100ml) {
        totalCost += ingredient.cost_per_100ml;
        ingredientCount++;
      }
    });
    
    const avgCost = ingredientCount > 0 ? totalCost / ingredientCount : 0;
    
    // Score based on cost efficiency (lower cost = higher score, but not too low)
    if (avgCost < 50) return 85; // Very cost-effective
    if (avgCost < 100) return 75; // Cost-effective
    if (avgCost < 200) return 60; // Moderate
    if (avgCost < 400) return 40; // Expensive
    return 20; // Very expensive
  };

  const calculateComplianceScore = (): number => {
    if (!ingredients.length) return 0;
    
    let score = 80; // Base compliance score
    
    ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase();
      const why = ingredient.why_chosen?.toLowerCase() || '';
      
      // Compliance indicators
      if (name.includes('fda') || name.includes('approved') || name.includes('certified') ||
          why.includes('compliant') || why.includes('approved') || why.includes('certified')) {
        score += 5;
      }
      
      // Safety concerns
      if (name.includes('paraben') || name.includes('sulfate') || name.includes('alcohol') ||
          why.includes('safety') || why.includes('gentle') || why.includes('mild')) {
        score += 3;
      }
    });
    
    return Math.min(100, score);
  };

  const calculateConsumerAppealScore = (): number => {
    if (!ingredients.length) return 0;
    
    let score = 70; // Base appeal score
    
    ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase();
      const why = ingredient.why_chosen?.toLowerCase() || '';
      
      // Popular/trendy ingredients
      if (name.includes('natural') || name.includes('organic') || name.includes('plant') ||
          name.includes('botanical') || name.includes('herbal') || name.includes('essential')) {
        score += 8;
      }
      
      // Consumer-friendly language
      if (why.includes('popular') || why.includes('trending') || why.includes('preferred') ||
          why.includes('loved') || why.includes('favorite')) {
        score += 5;
      }
    });
    
    return Math.min(100, score);
  };

  const calculateSustainabilityScore = (): number => {
    if (!ingredients.length) return 0;
    
    let score = 75; // Base sustainability score
    
    ingredients.forEach(ingredient => {
      const name = ingredient.name.toLowerCase();
      const why = ingredient.why_chosen?.toLowerCase() || '';
      
      // Sustainable ingredients
      if (name.includes('organic') || name.includes('natural') || name.includes('biodegradable') ||
          name.includes('recycled') || name.includes('sustainable') || name.includes('eco')) {
        score += 8;
      }
      
      // Sustainability mentions
      if (why.includes('sustainable') || why.includes('eco-friendly') || why.includes('green') ||
          why.includes('environmental') || why.includes('biodegradable')) {
        score += 5;
      }
    });
    
    return Math.min(100, score);
  };

  const getEfficacyDescription = (): string => {
    const score = calculateEfficacyScore();
    if (score >= 80) return "Excellent efficacy with high-quality active ingredients";
    if (score >= 60) return "Good efficacy with balanced active ingredients";
    if (score >= 40) return "Moderate efficacy with some active ingredients";
    return "Basic efficacy with minimal active ingredients";
  };

  const getCostEffectivenessDescription = (): string => {
    const score = calculateCostEffectivenessScore();
    if (score >= 80) return "Highly cost-effective with optimized ingredient costs";
    if (score >= 60) return "Cost-effective with reasonable ingredient pricing";
    if (score >= 40) return "Moderate cost with some premium ingredients";
    return "Premium pricing with high-cost ingredients";
  };

  const getComplianceDescription = (): string => {
    const score = calculateComplianceScore();
    if (score >= 90) return "Excellent compliance with all regulatory standards";
    if (score >= 75) return "Good compliance with most regulatory requirements";
    if (score >= 60) return "Moderate compliance with basic standards";
    return "Basic compliance with minimal regulatory coverage";
  };

  const getConsumerAppealDescription = (): string => {
    const score = calculateConsumerAppealScore();
    if (score >= 85) return "High consumer appeal with trending ingredients";
    if (score >= 70) return "Good consumer appeal with popular ingredients";
    if (score >= 55) return "Moderate consumer appeal with standard ingredients";
    return "Basic consumer appeal with traditional ingredients";
  };

  const getSustainabilityDescription = (): string => {
    const score = calculateSustainabilityScore();
    if (score >= 85) return "Excellent sustainability with eco-friendly ingredients";
    if (score >= 70) return "Good sustainability with natural ingredients";
    if (score >= 55) return "Moderate sustainability with some eco-friendly options";
    return "Basic sustainability with traditional ingredients";
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  // Radar chart component
  const RadarChart = ({ scores }: { scores: PriorityScore[] }) => {
    const size = 280;
    const center = size / 2;
    const radius = 100;
    
    const getPoint = (index: number, score: number) => {
      const angle = (index * 2 * Math.PI) / scores.length - Math.PI / 2;
      const distance = (score / 100) * radius;
      return {
        x: center + distance * Math.cos(angle),
        y: center + distance * Math.sin(angle)
      };
    };

    const getAxisPoint = (index: number) => {
      const angle = (index * 2 * Math.PI) / scores.length - Math.PI / 2;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle)
      };
    };

    const getPolygonPoints = () => {
      return scores.map((score, index) => {
        const point = getPoint(index, score.score);
        return `${point.x},${point.y}`;
      }).join(' ');
    };

    const getScoreColor = (score: number) => {
      if (score >= 80) return '#10b981'; // green-500
      if (score >= 60) return '#f59e0b'; // yellow-500
      if (score >= 40) return '#f97316'; // orange-500
      return '#ef4444'; // red-500
    };

    return (
      <div className="flex justify-center mb-8">
        <div className="relative">
          <svg width={size} height={size} className="drop-shadow-xl">
            {/* Definitions for gradients */}
            <defs>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ea580c" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0.1" />
              </linearGradient>
              
              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Background circle with gradient */}
            <circle
              cx={center}
              cy={center}
              r={radius + 8}
              fill="url(#greenGradient)"
              opacity="0.15"
            />
            
            {/* Grid circles with modern styling */}
            {[20, 40, 60, 80, 100].map((level, index) => (
              <circle
                key={level}
                cx={center}
                cy={center}
                r={(level / 100) * radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth={index === 4 ? "2" : "1"}
                strokeDasharray={index === 4 ? "none" : "5,5"}
                opacity="0.7"
              />
            ))}
            
            {/* Axis lines with gradient */}
            {scores.map((_, index) => {
              const axisPoint = getAxisPoint(index);
              return (
                <line
                  key={index}
                  x1={center}
                  y1={center}
                  x2={axisPoint.x}
                  y2={axisPoint.y}
                  stroke="url(#greenGradient)"
                  strokeWidth="2"
                  opacity="0.5"
                />
              );
            })}
            
            {/* Data polygon with modern styling and glow */}
            <polygon
              points={getPolygonPoints()}
              fill="url(#greenGradient)"
              stroke={colors.text.replace('text-', '')}
              strokeWidth="3"
              filter="url(#glow)"
              opacity="0.9"
            />
            
            {/* Enhanced data points with animations */}
            {scores.map((score, index) => {
              const point = getPoint(index, score.score);
              const color = getScoreColor(score.score);
              
              return (
                <g key={index}>
                  {/* Glow effect */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="10"
                    fill={color}
                    opacity="0.3"
                    filter="url(#glow)"
                  />
                  {/* Main point */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="6"
                    fill={color}
                    stroke="white"
                    strokeWidth="2.5"
                    className="drop-shadow-lg"
                  />
                  {/* Inner highlight */}
                  <circle
                    cx={point.x - 1.5}
                    cy={point.y - 1.5}
                    r="2.5"
                    fill="white"
                    opacity="0.9"
                  />
                </g>
              );
            })}
            
            {/* Center point with glow */}
            <circle
              cx={center}
              cy={center}
              r="5"
              fill={colors.text.replace('text-', '')}
              stroke="white"
              strokeWidth="2.5"
              filter="url(#glow)"
              className="drop-shadow-lg"
            />
          </svg>
          
          {/* Modern axis labels with better positioning */}
          {scores.map((score, index) => {
            const axisPoint = getAxisPoint(index);
            const labelRadius = radius + 30;
            const labelPoint = {
              x: center + labelRadius * Math.cos((index * 2 * Math.PI) / scores.length - Math.PI / 2),
              y: center + labelRadius * Math.sin((index * 2 * Math.PI) / scores.length - Math.PI / 2)
            };
            
            return (
              <div
                key={index}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: labelPoint.x,
                  top: labelPoint.y,
                }}
              >
                <div className="text-center">
                  <div className="text-xs font-bold text-gray-800 bg-white px-3 py-1.5 rounded-full shadow-md border border-gray-200 backdrop-blur-sm">
                    {score.axis}
                  </div>
                  <div className={`text-xs font-bold mt-1.5 ${getScoreColor(score.score) === '#10b981' ? 'text-green-600' : 
                    getScoreColor(score.score) === '#f59e0b' ? 'text-yellow-600' :
                    getScoreColor(score.score) === '#f97316' ? 'text-orange-600' : 'text-red-600'}`}>
                    {Math.round(score.score)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Priority Heatmap */}
      <div className={`${colors.cardBg} border ${colors.border} rounded-xl p-6`}>
        <h3 className={`text-xl font-bold ${colors.text} mb-4`}>Formulation Priority Analysis</h3>
        
        {/* Radar Chart */}
        {priorityScores.length > 0 && <RadarChart scores={priorityScores} />}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {priorityScores.map((priority, index) => (
            <div key={index} className={`${getScoreBgColor(priority.score)} border rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">{priority.axis}</span>
                <span className={`text-lg font-bold ${getScoreColor(priority.score)}`}>
                  {Math.round(priority.score)}%
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    priority.score >= 80 ? 'bg-green-500' :
                    priority.score >= 60 ? 'bg-yellow-500' :
                    priority.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.round(priority.score)}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-600">{priority.description}</p>
            </div>
          ))}
        </div>

        {/* Priority Balance Summary */}
        <div className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
          <h4 className={`font-semibold ${colors.text} mb-2`}>Priority Balance Summary</h4>
          <p className="text-sm text-gray-600">
            This formulation prioritizes {priorityScores.filter(p => p.score >= 70).length} out of 5 key areas 
            with strong performance. The balance focuses on {priorityScores.sort((a, b) => b.score - a.score)[0]?.axis.toLowerCase()} 
            as the primary driver, while maintaining competitive levels across other priorities.
          </p>
        </div>
      </div>

      {/* Enhanced Ingredient List */}
      <div className={`${colors.cardBg} border ${colors.border} rounded-xl p-6`}>
        <h3 className={`text-xl font-bold ${colors.text} mb-4`}>Ingredient Composition</h3>
        
        <div className="space-y-4">
          {ingredients.map((ingredient, index) => (
            <div key={index} className={`${colors.lightBg} border ${colors.border} rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800">{ingredient.name}</h4>
                <span className={`font-bold ${colors.text}`}>
                  {ingredient.percentage || ingredient.percent || ingredient.amount}%
                </span>
              </div>
              
              {ingredient.why_chosen && (
                <p className="text-sm text-gray-600 mb-2">{ingredient.why_chosen}</p>
              )}
              
              {ingredient.cost_per_100ml && (
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-500">Cost: ₹{ingredient.cost_per_100ml}/100ml</span>
                </div>
              )}
              
              {ingredient.suppliers && ingredient.suppliers.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Suppliers:</p>
                  <div className="space-y-1">
                    {ingredient.suppliers.slice(0, 2).map((supplier: any, supplierIndex: number) => (
                      <div key={supplierIndex} className="text-xs text-gray-600">
                        • {supplier.name} - {supplier.location}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
