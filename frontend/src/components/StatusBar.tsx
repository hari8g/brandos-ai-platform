import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusBarProps {
  status: 'idle' | 'thinking' | 'generating' | 'complete' | 'error';
  progress?: number;
  currentStep?: string;
  estimatedTime?: number;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({
  status = 'idle',
  progress = 0,
  currentStep = '',
  estimatedTime = 0,
  onPause,
  onResume,
  onCancel
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progressHistory, setProgressHistory] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (progress > 0) {
      setProgressHistory(prev => [...prev.slice(-10), progress]);
    }
  }, [progress]);

  useEffect(() => {
    if (status === 'complete') {
      playCompletionSound();
    }
  }, [status]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'thinking':
        return 'bg-blue-500';
      case 'generating':
        return 'bg-purple-500';
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'thinking':
        return 'from-blue-400 to-blue-600';
      case 'generating':
        return 'from-purple-400 to-purple-600';
      case 'complete':
        return 'from-green-400 to-green-600';
      case 'error':
        return 'from-red-400 to-red-600';
      default:
        return 'from-gray-300 to-gray-500';
    }
  };

  const getAnimationIcon = (status: string) => {
    switch (status) {
      case 'thinking':
        return '🤔';
      case 'generating':
        return '⚡';
      case 'complete':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⏸️';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'thinking':
        return 'Analyzing your request...';
      case 'generating':
        return 'Generating formulation...';
      case 'complete':
        return 'Formulation complete!';
      case 'error':
        return 'Something went wrong';
      default:
        return 'Ready';
    }
  };

  const playCompletionSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Handle audio play failure silently
      });
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      onResume?.();
    } else {
      onPause?.();
    }
    setIsPaused(!isPaused);
  };

  const progressVelocity = progressHistory.length >= 2 
    ? progressHistory[progressHistory.length - 1] - progressHistory[progressHistory.length - 2]
    : 0;

  if (status === 'idle') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className={`bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden ${
        isExpanded ? 'w-80' : 'w-64'
      }`}>
        {/* Main Status Bar */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: status === 'thinking' ? 360 : 0 }}
                transition={{ duration: 2, repeat: status === 'thinking' ? Infinity : 0 }}
                className="text-lg"
              >
                {getAnimationIcon(status)}
              </motion.div>
              <div>
                <h3 className="font-semibold text-gray-800">{getStatusDescription(status)}</h3>
                {currentStep && (
                  <p className="text-sm text-gray-600">{currentStep}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleToggleExpand}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? '−' : '+'}
            </button>
            </div>
            
          {/* Progress Bar */}
          {progress > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{Math.round(progress)}%</span>
                {estimatedTime > 0 && (
                  <span>{Math.round(estimatedTime)}s remaining</span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full bg-gradient-to-r ${getStatusGradient(status)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {(status === 'thinking' || status === 'generating') && (
            <div className="flex space-x-2">
              <button
                onClick={handlePauseResume}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button
                onClick={onCancel}
                className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
              >
                ❌ Cancel
              </button>
          </div>
          )}
        </div>
        
        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="border-t border-gray-200 p-4 bg-gray-50"
            >
              <h4 className="font-medium text-gray-700 mb-2">Progress Details</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Velocity:</span>
                  <span>{progressVelocity > 0 ? `+${progressVelocity.toFixed(1)}%/s` : '0%/s'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="capitalize">{status}</span>
                </div>
                {progressHistory.length > 0 && (
                  <div className="flex justify-between">
                    <span>History:</span>
                    <span>{progressHistory.slice(-3).join('% → ')}%</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Audio element for sound effects */}
      <audio
        ref={audioRef}
        preload="auto"
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvGEeByeH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvGEeByeH0/LNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvGEeByeH0/LNeSs="
      />
    </motion.div>
  );
};

export default StatusBar;