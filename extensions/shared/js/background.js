let connectionCheckInterval;

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
    initializeExtension();
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started, initializing extension');
  initializeExtension();
});

function initializeExtension() {
  createContextMenu();
  startQueueProcessing();
}

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'save-bookmark',
      title: 'Save to Bookmarks',
      contexts: ['page', 'link']
    });

    chrome.contextMenus.create({
      id: 'save-with-selection',
      title: 'Save with selected text',
      contexts: ['selection']
    });
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-bookmark') {
    chrome.action.openPopup();
  } else if (info.menuItemId === 'save-with-selection') {
    handleSelectionBookmark(info, tab);
  }
});

async function handleSelectionBookmark(info, tab) {
  try {
    const bookmark = {
      url: info.linkUrl || tab.url,
      title: tab.title,
      notes: info.selectionText || '',
      tags: [],
      codeSnippet: '',
      createdAt: new Date().toISOString()
    };

    const result = await sendBookmarkToDesktop(bookmark);
    
    if (result.success) {
      showNotificationBadge('✓');
    } else {
      throw new Error('Failed to send bookmark');
    }
  } catch (error) {
    console.error('Failed to save bookmark from selection:', error);
    
    try {
      await queueBookmark(bookmark);
      showNotificationBadge('⏱');
    } catch (queueError) {
      console.error('Failed to queue bookmark:', queueError);
      showNotificationBadge('✗');
    }
  }
}

async function sendBookmarkToDesktop(bookmark) {
  const HTTP_ENDPOINT = 'http://localhost:8765';
  
  try {
    const response = await fetch(`${HTTP_ENDPOINT}/bookmarks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookmark),
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function queueBookmark(bookmark) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['bookmark_queue'], (result) => {
      const queue = result.bookmark_queue || [];
      
      const queuedBookmark = {
        ...bookmark,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        queuedAt: new Date().toISOString(),
        retryCount: 0
      };
      
      queue.push(queuedBookmark);
      
      chrome.storage.local.set({ bookmark_queue: queue }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  });
}

async function processQueue() {
  try {
    const result = await chrome.storage.local.get(['bookmark_queue']);
    const queue = result.bookmark_queue || [];
    
    if (queue.length === 0) {
      return;
    }

    console.log(`Processing ${queue.length} queued bookmarks`);
    
    const remainingQueue = [];
    let processedCount = 0;

    for (const bookmark of queue) {
      try {
        await sendBookmarkToDesktop(bookmark);
        processedCount++;
      } catch (error) {
        bookmark.retryCount = (bookmark.retryCount || 0) + 1;
        bookmark.lastError = error.message;
        bookmark.lastRetryAt = new Date().toISOString();
        
        if (bookmark.retryCount < 5) {
          remainingQueue.push(bookmark);
        }
      }
    }

    await chrome.storage.local.set({ bookmark_queue: remainingQueue });
    
    if (processedCount > 0) {
      console.log(`Processed ${processedCount} queued bookmarks`);
      updateBadge(remainingQueue.length);
    }
  } catch (error) {
    console.error('Error processing queue:', error);
  }
}

function startQueueProcessing() {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }
  
  processQueue();
  
  connectionCheckInterval = setInterval(() => {
    processQueue();
  }, 30000);
}

async function updateBadge(queueSize) {
  if (queueSize > 0) {
    chrome.action.setBadgeText({ text: queueSize.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

function showNotificationBadge(text) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
  
  setTimeout(() => {
    chrome.storage.local.get(['bookmark_queue'], (result) => {
      const queueSize = (result.bookmark_queue || []).length;
      updateBadge(queueSize);
    });
  }, 2000);
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.bookmark_queue) {
    const queueSize = (changes.bookmark_queue.newValue || []).length;
    updateBadge(queueSize);
  }
});

chrome.alarms.create('processQueue', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'processQueue') {
    processQueue();
  }
});

chrome.storage.local.get(['bookmark_queue'], (result) => {
  const queueSize = (result.bookmark_queue || []).length;
  updateBadge(queueSize);
});
