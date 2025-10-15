const CommunicationManager = (function() {
  const HTTP_ENDPOINT = 'http://localhost:8765';
  const NATIVE_APP_NAME = 'com.bookmarkmanager.native';
  const CONNECTION_TIMEOUT = 5000;
  const RETRY_DELAY = 2000;

  let connectionStatus = 'checking';
  let statusCallbacks = [];
  let useNativeMessaging = false;

  function notifyStatusChange(status) {
    connectionStatus = status;
    statusCallbacks.forEach(callback => callback(status));
  }

  function registerStatusCallback(callback) {
    statusCallbacks.push(callback);
    callback(connectionStatus);
  }

  async function checkHttpConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT);
      
      const response = await fetch(`${HTTP_ENDPOINT}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async function checkNativeConnection() {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendNativeMessage) {
      return false;
    }

    return new Promise((resolve) => {
      try {
        chrome.runtime.sendNativeMessage(
          NATIVE_APP_NAME,
          { type: 'ping' },
          (response) => {
            if (chrome.runtime.lastError) {
              resolve(false);
            } else {
              resolve(response && response.type === 'pong');
            }
          }
        );
        
        setTimeout(() => resolve(false), CONNECTION_TIMEOUT);
      } catch (error) {
        resolve(false);
      }
    });
  }

  async function checkConnection() {
    const nativeAvailable = await checkNativeConnection();
    
    if (nativeAvailable) {
      useNativeMessaging = true;
      notifyStatusChange('online');
      return true;
    }

    const httpAvailable = await checkHttpConnection();
    
    if (httpAvailable) {
      useNativeMessaging = false;
      notifyStatusChange('online');
      return true;
    }

    notifyStatusChange('offline');
    return false;
  }

  async function sendBookmarkViaHttp(bookmark) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT);
    
    try {
      const response = await fetch(`${HTTP_ENDPOINT}/bookmarks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookmark),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async function sendBookmarkViaNative(bookmark) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendNativeMessage(
          NATIVE_APP_NAME,
          {
            type: 'save_bookmark',
            data: bookmark
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (response && response.success) {
              resolve(response);
            } else {
              reject(new Error(response?.error || 'Unknown error'));
            }
          }
        );
        
        setTimeout(() => reject(new Error('Native messaging timeout')), CONNECTION_TIMEOUT);
      } catch (error) {
        reject(error);
      }
    });
  }

  async function sendBookmark(bookmark) {
    const isConnected = await checkConnection();
    
    if (!isConnected) {
      throw new Error('Desktop app is not available');
    }

    try {
      if (useNativeMessaging) {
        return await sendBookmarkViaNative(bookmark);
      } else {
        return await sendBookmarkViaHttp(bookmark);
      }
    } catch (error) {
      notifyStatusChange('offline');
      throw error;
    }
  }

  function startConnectionMonitoring() {
    setInterval(async () => {
      await checkConnection();
    }, 10000);
  }

  async function initialize() {
    await checkConnection();
    startConnectionMonitoring();
  }

  return {
    initialize,
    sendBookmark,
    checkConnection,
    registerStatusCallback,
    getConnectionStatus: () => connectionStatus
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CommunicationManager;
}
