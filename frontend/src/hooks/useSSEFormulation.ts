import { useState, useCallback, useRef } from 'react';
import type { GenerateRequest, GenerateResponse } from '../types/formulation';

interface SSEStatusUpdate {
  status: string;
  message: string;
  progress: number;
  data?: GenerateResponse;
  error?: string;
}

interface UseSSEFormulationReturn {
  isStreaming: boolean;
  currentStatus: SSEStatusUpdate | null;
  formulation: GenerateResponse | null;
  error: string | null;
  startFormulationStream: (request: GenerateRequest) => void;
  stopFormulationStream: () => void;
}

export function useSSEFormulation(): UseSSEFormulationReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<SSEStatusUpdate | null>(null);
  const [formulation, setFormulation] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const stopFormulationStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    setCurrentStatus(null);
  }, []);

  const startFormulationStream = useCallback((request: GenerateRequest) => {
    // Clean up any existing connection
    stopFormulationStream();
    
    setIsStreaming(true);
    setError(null);
    setFormulation(null);

    try {
      // Create the SSE connection
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000' 
        : '';
      
      const url = `${baseUrl}/formulation/generate/stream`;
      
      // Create a POST request for SSE (we'll need to handle this specially)
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(request),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response body reader available');
        }

        const decoder = new TextDecoder();
        
        const readStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                break;
              }
              
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.substring(6));
                    setCurrentStatus(data);
                    
                    if (data.status === 'complete' && data.data) {
                      setFormulation(data.data);
                      setIsStreaming(false);
                      // Auto-hide after 3 seconds
                      setTimeout(() => {
                        setCurrentStatus(null);
                      }, 3000);
                    } else if (data.status === 'error') {
                      setError(data.error || 'Unknown error occurred');
                      setIsStreaming(false);
                      // Auto-hide after 5 seconds
                      setTimeout(() => {
                        setCurrentStatus(null);
                      }, 5000);
                    }
                  } catch (parseError) {
                    console.error('Error parsing SSE data:', parseError);
                  }
                }
              }
            }
          } catch (readError) {
            console.error('Error reading stream:', readError);
            setError('Connection error occurred');
            setIsStreaming(false);
          }
        };
        
        readStream();
      })
      .catch(fetchError => {
        console.error('Error starting SSE stream:', fetchError);
        setError('Failed to connect to server');
        setIsStreaming(false);
      });

    } catch (err) {
      console.error('Error in startFormulationStream:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsStreaming(false);
    }
  }, [stopFormulationStream]);

  return {
    isStreaming,
    currentStatus,
    formulation,
    error,
    startFormulationStream,
    stopFormulationStream,
  };
}