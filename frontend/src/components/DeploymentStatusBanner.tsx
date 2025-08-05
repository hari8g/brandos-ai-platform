import React, { useState, useEffect } from 'react';
import keepaliveService from '../services/keepalive';

interface DeploymentStatusBannerProps {
  show?: boolean;
}

const DeploymentStatusBanner: React.FC<DeploymentStatusBannerProps> = ({ show = true }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<'checking' | 'warming' | 'ready' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const isProduction = window.location.hostname !== 'localhost';

  useEffect(() => {
    if (!show || !isProduction) return;

    const checkBackendStatus = async () => {
      setIsVisible(true);
      setStatus('checking');
      setMessage('Checking backend status...');

      try {
        const isWarm = await keepaliveService.pingBackend();
        
        if (isWarm) {
          setStatus('ready');
          setMessage('Backend is ready');
          setTimeout(() => setIsVisible(false), 3000);
        } else {
          setStatus('warming');
          setMessage('Backend is starting up (this may take 1-2 minutes)...');
          
          // Try to warm up the backend
          const warmedUp = await keepaliveService.warmupBackend();
          
          if (warmedUp) {
            setStatus('ready');
            setMessage('Backend is now ready');
            setTimeout(() => setIsVisible(false), 3000);
          } else {
            setStatus('error');
            setMessage('Backend warmup failed. Formulations may take longer than usual.');
            setTimeout(() => setIsVisible(false), 10000);
          }
        }
      } catch (error) {
        setStatus('error');
        setMessage('Unable to connect to backend. Please try again later.');
        setTimeout(() => setIsVisible(false), 10000);
      }
    };

    checkBackendStatus();
  }, [show, isProduction]);

  if (!isVisible || !isProduction) return null;

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warming':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'ready':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return '🔄';
      case 'warming':
        return '🔥';
      case 'ready':
        return '✅';
      case 'error':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm ${getStatusColor()}`}>
      <div className="flex items-center space-x-2">
        <span className="text-xl">{getStatusIcon()}</span>
        <div>
          <p className="font-medium text-sm">Backend Status</p>
          <p className="text-xs">{message}</p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      {status === 'warming' && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-yellow-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-xs mt-1 opacity-75">
            Free tier services need time to start up. Thank you for your patience!
          </p>
        </div>
      )}
    </div>
  );
};

export default DeploymentStatusBanner; 