import React from 'react';
import { motion } from 'framer-motion';

interface StatusBarProps {
  isVisible: boolean;
  message: string;
  progress: number;
  status: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  isVisible, 
  message, 
  progress, 
  status 
}) => {
  if (!isVisible) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'thinking':
        return 'bg-blue-500';
      case 'analyzing':
        return 'bg-purple-500';
      case 'researching':
        return 'bg-green-500';
      case 'brainstorming':
        return 'bg-yellow-500';
      case 'calculating':
        return 'bg-orange-500';
      case 'validating':
        return 'bg-emerald-500';
      case 'optimizing':
        return 'bg-red-500';
      case 'sourcing':
        return 'bg-indigo-500';
      case 'packaging':
        return 'bg-pink-500';
      case 'finalizing':
        return 'bg-teal-500';
      case 'complete':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-blue-500';
    }
  };

  const getAnimationIcon = (status: string) => {
    switch (status) {
      case 'thinking':
        return '🤔';
      case 'analyzing':
        return '🔍';
      case 'researching':
        return '📚';
      case 'brainstorming':
        return '💡';
      case 'calculating':
        return '🧮';
      case 'validating':
        return '✅';
      case 'optimizing':
        return '⚡';
      case 'sourcing':
        return '🏪';
      case 'packaging':
        return '📦';
      case 'finalizing':
        return '🎯';
      case 'complete':
        return '🎉';
      case 'error':
        return '❌';
      default:
        return '🔄';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[400px] max-w-md"
    >
      <div className="flex items-center space-x-3">
        <motion.div
          animate={{ 
            rotate: status === 'thinking' ? [0, 10, -10, 0] : 0,
            scale: status === 'complete' ? [1, 1.2, 1] : 1
          }}
          transition={{ 
            duration: status === 'thinking' ? 2 : 0.5,
            repeat: status === 'thinking' ? Infinity : 0
          }}
          className="text-2xl"
        >
          {getAnimationIcon(status)}
        </motion.div>
        
        <div className="flex-1">
          <motion.p
            key={message}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm font-medium text-gray-700 mb-2"
          >
            {message}
          </motion.p>
          
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-2 rounded-full ${getStatusColor(status)}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500 capitalize">{status}</span>
            <span className="text-xs text-gray-500">{progress}%</span>
          </div>
        </div>
      </div>
      
      {/* Subtle animation background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-20 rounded-lg pointer-events-none" />
      
      {/* Pulse animation for active status */}
      {status !== 'complete' && status !== 'error' && (
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg opacity-20"
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
};