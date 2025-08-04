export interface CategoryColors {
  primary: string;
  secondary: string;
  tertiary: string;
  gradient: string;
  hoverGradient: string;
  text: string;
  border: string;
  focus: string;
  bg: string;
  icon: string;
  lightBg: string;
  cardBg: string;
  buttonGradient: string;
  buttonHoverGradient: string;
}

export function getCategoryColors(category: string | null): CategoryColors {
  switch (category) {
    case 'cosmetics':
      return {
        primary: 'pink',
        secondary: 'purple',
        tertiary: 'indigo',
        gradient: 'from-pink-400 via-purple-400 to-indigo-400',
        hoverGradient: 'from-pink-500 via-purple-500 to-indigo-500',
        text: 'text-pink-600',
        border: 'border-pink-200',
        focus: 'focus:border-pink-500 focus:ring-pink-200',
        bg: 'bg-pink-50',
        icon: 'text-pink-700',
        lightBg: 'bg-pink-50',
        cardBg: 'bg-gradient-to-r from-pink-50 to-purple-50',
        buttonGradient: 'from-pink-500 to-purple-600',
        buttonHoverGradient: 'from-pink-600 to-purple-700'
      };
    case 'pet food':
      return {
        primary: 'orange',
        secondary: 'amber',
        tertiary: 'yellow',
        gradient: 'from-orange-400 via-amber-400 to-yellow-400',
        hoverGradient: 'from-orange-500 via-amber-500 to-yellow-500',
        text: 'text-orange-600',
        border: 'border-orange-200',
        focus: 'focus:border-orange-500 focus:ring-orange-200',
        bg: 'bg-orange-50',
        icon: 'text-orange-700',
        lightBg: 'bg-orange-50',
        cardBg: 'bg-gradient-to-r from-orange-50 to-amber-50',
        buttonGradient: 'from-orange-500 to-amber-600',
        buttonHoverGradient: 'from-orange-600 to-amber-700'
      };
    default:
      return {
        primary: 'purple',
        secondary: 'indigo',
        tertiary: 'blue',
        gradient: 'from-purple-400 via-indigo-400 to-blue-400',
        hoverGradient: 'from-purple-500 via-indigo-500 to-blue-500',
        text: 'text-purple-600',
        border: 'border-purple-200',
        focus: 'focus:border-purple-500 focus:ring-purple-200',
        bg: 'bg-purple-50',
        icon: 'text-purple-700',
        lightBg: 'bg-purple-50',
        cardBg: 'bg-gradient-to-r from-purple-50 to-indigo-50',
        buttonGradient: 'from-purple-500 to-indigo-600',
        buttonHoverGradient: 'from-purple-600 to-indigo-700'
      };
  }
} 