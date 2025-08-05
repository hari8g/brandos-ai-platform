import apiClient from './apiClient';

class KeepaliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private isProduction = window.location.hostname !== 'localhost';
  private keepaliveInterval = 10 * 60 * 1000; // 10 minutes

  constructor() {
    if (this.isProduction) {
      this.startKeepalive();
    }
  }

  async pingBackend(): Promise<boolean> {
    try {
      console.log('🏓 Pinging backend to keep it warm...');
      const response = await apiClient.get('/keepalive', { timeout: 30000 });
      console.log('✅ Backend is warm and responsive', response.data);
      return true;
    } catch (error) {
      console.warn('⚠️ Keepalive ping failed:', error);
      return false;
    }
  }

  startKeepalive() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Initial ping
    this.pingBackend();

    // Set up periodic pings
    this.intervalId = setInterval(() => {
      this.pingBackend();
    }, this.keepaliveInterval);

    console.log(`🚀 Keepalive service started (${this.keepaliveInterval / 1000 / 60} minute intervals)`);
  }

  stopKeepalive() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Keepalive service stopped');
    }
  }

  async warmupBackend(): Promise<boolean> {
    console.log('🔥 Warming up backend service...');
    try {
      // Try multiple pings to ensure warmup
      const promises = [
        this.pingBackend(),
        new Promise(resolve => setTimeout(() => resolve(this.pingBackend()), 2000)),
        new Promise(resolve => setTimeout(() => resolve(this.pingBackend()), 5000)),
      ];
      
      const results = await Promise.all(promises);
      const successCount = results.filter(Boolean).length;
      
      if (successCount >= 2) {
        console.log('✅ Backend is now warm and ready');
        return true;
      } else {
        console.warn('⚠️ Backend warmup partially failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Backend warmup failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const keepaliveService = new KeepaliveService();
export default keepaliveService; 