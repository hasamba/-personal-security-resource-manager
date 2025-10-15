const QueueManager = (function() {
  const QUEUE_KEY = 'bookmark_queue';
  const MAX_QUEUE_SIZE = 100;
  
  let queueCallbacks = [];

  function notifyQueueChange(queue) {
    queueCallbacks.forEach(callback => callback(queue));
  }

  function registerQueueCallback(callback) {
    queueCallbacks.push(callback);
    getQueue().then(queue => callback(queue));
  }

  async function getQueue() {
    return new Promise((resolve) => {
      chrome.storage.local.get([QUEUE_KEY], (result) => {
        resolve(result[QUEUE_KEY] || []);
      });
    });
  }

  async function saveQueue(queue) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [QUEUE_KEY]: queue }, () => {
        notifyQueueChange(queue);
        resolve();
      });
    });
  }

  async function addToQueue(bookmark) {
    const queue = await getQueue();
    
    if (queue.length >= MAX_QUEUE_SIZE) {
      throw new Error(`Queue is full (max ${MAX_QUEUE_SIZE} items)`);
    }

    const queuedBookmark = {
      ...bookmark,
      id: generateId(),
      queuedAt: new Date().toISOString(),
      retryCount: 0
    };

    queue.push(queuedBookmark);
    await saveQueue(queue);
    
    return queuedBookmark;
  }

  async function removeFromQueue(bookmarkId) {
    const queue = await getQueue();
    const filteredQueue = queue.filter(item => item.id !== bookmarkId);
    await saveQueue(filteredQueue);
  }

  async function getQueueSize() {
    const queue = await getQueue();
    return queue.length;
  }

  async function clearQueue() {
    await saveQueue([]);
  }

  async function processQueue(sendFunction) {
    const queue = await getQueue();
    
    if (queue.length === 0) {
      return { processed: 0, failed: 0 };
    }

    let processed = 0;
    let failed = 0;
    const remainingQueue = [];

    for (const bookmark of queue) {
      try {
        await sendFunction(bookmark);
        processed++;
      } catch (error) {
        console.error('Failed to process queued bookmark:', error);
        bookmark.retryCount = (bookmark.retryCount || 0) + 1;
        bookmark.lastError = error.message;
        bookmark.lastRetryAt = new Date().toISOString();
        
        if (bookmark.retryCount < 5) {
          remainingQueue.push(bookmark);
        } else {
          failed++;
        }
      }
    }

    await saveQueue(remainingQueue);
    
    return { processed, failed, remaining: remainingQueue.length };
  }

  function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async function getQueueStats() {
    const queue = await getQueue();
    return {
      size: queue.length,
      oldestItem: queue.length > 0 ? queue[0].queuedAt : null,
      hasFailedItems: queue.some(item => item.retryCount > 0)
    };
  }

  return {
    addToQueue,
    removeFromQueue,
    getQueue,
    getQueueSize,
    clearQueue,
    processQueue,
    getQueueStats,
    registerQueueCallback
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = QueueManager;
}
