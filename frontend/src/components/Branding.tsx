import React, { useState } from 'react';
import { getCategoryColors } from '@/lib/colorUtils';

interface BrandNameSuggestion {
  name: string;
  meaning: string;
  category: string;
  reasoning: string;
  availability_check: string;
}

interface SocialMediaChannel {
  platform: string;
  content_strategy: string;
  target_audience: string;
  post_frequency: string;
  content_ideas: string[];
  hashtag_strategy: string[];
  engagement_tips: string[];
}

interface BrandingStrategy {
  brand_name_suggestions: BrandNameSuggestion[];
  social_media_channels: SocialMediaChannel[];
  overall_branding_theme: string;
  brand_personality: string;
  visual_identity_guidelines: string[];
  marketing_messaging: string[];
}

interface BrandingProps {
  brandingStrategy: BrandingStrategy;
  selectedCategory?: string | null;
}

const Branding: React.FC<BrandingProps> = ({ brandingStrategy, selectedCategory }) => {
  const colors = getCategoryColors(selectedCategory || null);
  const [selectedTab, setSelectedTab] = useState<'names' | 'social' | 'strategy'>('names');

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return '📸';
      case 'tiktok': return '🎵';
      case 'youtube': return '📺';
      case 'linkedin': return '💼';
      case 'facebook': return '📘';
      default: return '📱';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'modern': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'traditional': return 'bg-green-50 text-green-700 border-green-200';
      case 'premium': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'eco-friendly': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
            🎨
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${colors.text} tracking-tight`}>
              Branding Strategy
            </h3>
            <p className={`text-sm ${colors.text} opacity-70 mt-1 font-medium`}>
              Comprehensive brand development and social media strategies
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${colors.icon} animate-pulse`}></div>
          <span className={`text-xs font-semibold ${colors.text} opacity-70 tracking-wide uppercase`}>
            Brand Development
          </span>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="flex space-x-1 bg-gray-50 rounded-xl p-1.5 border border-gray-200">
        {[
          { key: 'names', label: 'Brand Names', icon: '🏷️' },
          { key: 'social', label: 'Social Media', icon: '📱' },
          { key: 'strategy', label: 'Strategy', icon: '📋' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as 'names' | 'social' | 'strategy')}
            className={`
              flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-300
              ${selectedTab === tab.key 
                ? `${colors.bg} text-white shadow-lg transform scale-105` 
                : `${colors.text} hover:${colors.lightBg} hover:scale-102`
              }
            `}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Enhanced Tab Content */}
      {selectedTab === 'names' && (
        <div className="space-y-8">
          {/* Brand Name Suggestions */}
          <div className={`${colors.cardBg} border ${colors.border} rounded-2xl p-8 shadow-lg`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center text-white font-bold text-lg`}>
                🏷️
              </div>
              <div>
                <h4 className={`text-xl font-bold ${colors.text} tracking-tight`}>
                  Brand Name Suggestions
                </h4>
                <p className={`text-sm ${colors.text} opacity-70 mt-1`}>
                  Strategic brand names tailored to your product category
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {brandingStrategy.brand_name_suggestions.map((suggestion, index) => (
                <div key={index} className={`bg-white/80 border ${colors.border} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105`}>
                  <div className="flex items-center justify-between mb-4">
                    <h5 className={`font-bold text-xl ${colors.text} tracking-tight`}>
                      {suggestion.name}
                    </h5>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getCategoryColor(suggestion.category)}`}>
                      {suggestion.category}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <span className={`text-xs font-semibold ${colors.text} opacity-70 tracking-wide uppercase`}>Meaning</span>
                      <p className={`text-sm ${colors.text} mt-1 leading-relaxed`}>{suggestion.meaning}</p>
                    </div>
                    
                    <div>
                      <span className={`text-xs font-semibold ${colors.text} opacity-70 tracking-wide uppercase`}>Strategic Reasoning</span>
                      <p className={`text-sm ${colors.text} mt-1 leading-relaxed`}>{suggestion.reasoning}</p>
                    </div>
                    
                    <div>
                      <span className={`text-xs font-semibold ${colors.text} opacity-70 tracking-wide uppercase`}>Trademark Status</span>
                      <p className={`text-sm ${colors.text} mt-1 leading-relaxed`}>{suggestion.availability_check}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'social' && (
        <div className="space-y-8">
          {/* Social Media Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {brandingStrategy.social_media_channels.map((channel, index) => (
              <div key={index} className={`${colors.cardBg} border ${colors.border} rounded-2xl p-8 shadow-lg`}>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="text-3xl">{getPlatformIcon(channel.platform)}</div>
                  <div>
                    <h4 className={`text-xl font-bold ${colors.text} tracking-tight`}>{channel.platform}</h4>
                    <p className={`text-sm ${colors.text} opacity-70 mt-1 font-medium`}>{channel.target_audience}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className={`text-xs font-semibold ${colors.text} opacity-70 tracking-wide uppercase`}>Content Strategy</span>
                    <p className={`text-sm ${colors.text} mt-2 leading-relaxed font-medium`}>{channel.content_strategy}</p>
                  </div>

                  <div>
                    <span className={`text-xs font-semibold ${colors.text} opacity-70 tracking-wide uppercase`}>Post Frequency</span>
                    <p className={`text-sm ${colors.text} mt-2 leading-relaxed font-medium`}>{channel.post_frequency}</p>
                  </div>

                  <div>
                    <span className={`text-xs font-semibold ${colors.text} opacity-70 tracking-wide uppercase`}>Content Ideas</span>
                    <div className="mt-3 space-y-2">
                      {channel.content_ideas.slice(0, 3).map((idea, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full ${colors.icon} mt-2 flex-shrink-0`}></div>
                          <span className={`text-sm ${colors.text} leading-relaxed`}>{idea}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className={`text-xs font-semibold ${colors.text} opacity-70 tracking-wide uppercase`}>Top Hashtags</span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {channel.hashtag_strategy.slice(0, 5).map((hashtag, idx) => (
                        <span key={idx} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${colors.lightBg} ${colors.text} border ${colors.border}`}>
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className={`text-xs font-semibold ${colors.text} opacity-70 tracking-wide uppercase`}>Engagement Tips</span>
                    <div className="mt-3 space-y-2">
                      {channel.engagement_tips.slice(0, 2).map((tip, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                          <span className={`text-sm ${colors.text} leading-relaxed`}>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'strategy' && (
        <div className="space-y-8">
          {/* Overall Branding Theme */}
          <div className={`${colors.cardBg} border ${colors.border} rounded-2xl p-8 shadow-lg`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center text-white font-bold text-lg`}>
                🎯
              </div>
              <div>
                <h4 className={`text-xl font-bold ${colors.text} tracking-tight`}>
                  Overall Branding Theme
                </h4>
                <p className={`text-sm ${colors.text} opacity-70 mt-1`}>
                  Core brand positioning and messaging framework
                </p>
              </div>
            </div>
            <p className={`${colors.text} text-base leading-relaxed font-medium`}>
              {brandingStrategy.overall_branding_theme}
            </p>
          </div>

          {/* Brand Personality */}
          <div className={`${colors.cardBg} border ${colors.border} rounded-2xl p-8 shadow-lg`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center text-white font-bold text-lg`}>
                👤
              </div>
              <div>
                <h4 className={`text-xl font-bold ${colors.text} tracking-tight`}>
                  Brand Personality
                </h4>
                <p className={`text-sm ${colors.text} opacity-70 mt-1`}>
                  Character traits and voice guidelines
                </p>
              </div>
            </div>
            <p className={`${colors.text} text-base leading-relaxed font-medium`}>
              {brandingStrategy.brand_personality}
            </p>
          </div>

          {/* Visual Identity Guidelines */}
          <div className={`${colors.cardBg} border ${colors.border} rounded-2xl p-8 shadow-lg`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center text-white font-bold text-lg`}>
                🎨
              </div>
              <div>
                <h4 className={`text-xl font-bold ${colors.text} tracking-tight`}>
                  Visual Identity Guidelines
                </h4>
                <p className={`text-sm ${colors.text} opacity-70 mt-1`}>
                  Design principles and visual standards
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {brandingStrategy.visual_identity_guidelines.map((guideline, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${colors.icon} mt-2.5 flex-shrink-0`}></div>
                  <span className={`text-base ${colors.text} leading-relaxed font-medium`}>
                    {guideline}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Marketing Messaging */}
          <div className={`${colors.cardBg} border ${colors.border} rounded-2xl p-8 shadow-lg`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center text-white font-bold text-lg`}>
                📢
              </div>
              <div>
                <h4 className={`text-xl font-bold ${colors.text} tracking-tight`}>
                  Marketing Messaging
                </h4>
                <p className={`text-sm ${colors.text} opacity-70 mt-1`}>
                  Key communication pillars and messaging framework
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {brandingStrategy.marketing_messaging.map((message, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-400 mt-2.5 flex-shrink-0"></div>
                  <span className={`text-base ${colors.text} leading-relaxed font-medium`}>
                    {message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branding; 