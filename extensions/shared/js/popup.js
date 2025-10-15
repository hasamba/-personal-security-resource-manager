document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('bookmark-form');
  const urlInput = document.getElementById('url');
  const titleInput = document.getElementById('title');
  const tagsInput = document.getElementById('tags');
  const notesInput = document.getElementById('notes');
  const codeSnippetInput = document.getElementById('code-snippet');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const saveText = document.getElementById('save-text');
  const saveSpinner = document.getElementById('save-spinner');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const queueInfo = document.getElementById('queue-info');
  const queueCount = document.getElementById('queue-count');
  const notesCount = document.getElementById('notes-count');
  const codeCount = document.getElementById('code-count');

  async function initializePopup() {
    await CommunicationManager.initialize();
    
    setupCharacterCounters();
    setupValidation();
    setupConnectionStatus();
    setupQueueDisplay();
    await populateCurrentPageInfo();
    
    await QueueManager.processQueue(CommunicationManager.sendBookmark);
  }

  function setupCharacterCounters() {
    notesInput.addEventListener('input', () => {
      notesCount.textContent = notesInput.value.length;
    });

    codeSnippetInput.addEventListener('input', () => {
      codeCount.textContent = codeSnippetInput.value.length;
    });
  }

  function setupValidation() {
    ValidationManager.setupRealtimeValidation('url');
    ValidationManager.setupRealtimeValidation('title');
    ValidationManager.setupRealtimeValidation('tags');
    ValidationManager.setupRealtimeValidation('notes');
    ValidationManager.setupRealtimeValidation('code-snippet');
  }

  function setupConnectionStatus() {
    CommunicationManager.registerStatusCallback((status) => {
      statusDot.className = 'status-dot';
      
      switch (status) {
        case 'online':
          statusDot.classList.add('online');
          statusText.textContent = 'Connected to desktop app';
          break;
        case 'offline':
          statusDot.classList.add('offline');
          statusText.textContent = 'Desktop app unavailable (queuing enabled)';
          break;
        case 'checking':
          statusDot.classList.add('checking');
          statusText.textContent = 'Checking connection...';
          break;
      }
    });
  }

  function setupQueueDisplay() {
    QueueManager.registerQueueCallback((queue) => {
      const size = queue.length;
      queueCount.textContent = size;
      
      if (size > 0) {
        queueInfo.classList.remove('hidden');
      } else {
        queueInfo.classList.add('hidden');
      }
    });
  }

  async function populateCurrentPageInfo() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab) {
        urlInput.value = tab.url || '';
        titleInput.value = tab.title || '';
        
        urlInput.dispatchEvent(new Event('input'));
        titleInput.dispatchEvent(new Event('input'));
      }
    } catch (error) {
      console.error('Failed to get current tab info:', error);
    }
  }

  function getFormData() {
    return {
      url: urlInput.value.trim(),
      title: titleInput.value.trim(),
      tags: tagsInput.value.trim(),
      notes: notesInput.value.trim(),
      codeSnippet: codeSnippetInput.value.trim()
    };
  }

  function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notification.className = `notification ${type}`;
    notificationText.textContent = message;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 3000);
  }

  function setFormLoading(isLoading) {
    saveBtn.disabled = isLoading;
    
    if (isLoading) {
      saveText.classList.add('hidden');
      saveSpinner.classList.remove('hidden');
    } else {
      saveText.classList.remove('hidden');
      saveSpinner.classList.add('hidden');
    }
    
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.disabled = isLoading;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    
    ValidationManager.clearErrors();
    const formData = getFormData();
    const { isValid, errors } = ValidationManager.validateForm(formData);
    
    if (!isValid) {
      Object.entries(errors).forEach(([fieldName, errorMessage]) => {
        ValidationManager.displayError(fieldName, errorMessage);
      });
      showNotification('Please fix the errors in the form', 'error');
      return;
    }

    setFormLoading(true);

    const bookmark = {
      url: formData.url,
      title: formData.title,
      tags: ValidationManager.parseTags(formData.tags),
      notes: formData.notes,
      codeSnippet: formData.codeSnippet,
      createdAt: new Date().toISOString()
    };

    try {
      await CommunicationManager.sendBookmark(bookmark);
      showNotification('Bookmark saved successfully!', 'success');
      
      setTimeout(() => {
        window.close();
      }, 1000);
    } catch (error) {
      console.error('Failed to send bookmark:', error);
      
      try {
        await QueueManager.addToQueue(bookmark);
        showNotification('Desktop app unavailable. Bookmark queued for later sync.', 'warning');
        
        setTimeout(() => {
          window.close();
        }, 2000);
      } catch (queueError) {
        console.error('Failed to queue bookmark:', queueError);
        showNotification(`Failed to save: ${queueError.message}`, 'error');
      }
    } finally {
      setFormLoading(false);
    }
  }

  function handleCancel() {
    window.close();
  }

  form.addEventListener('submit', handleSubmit);
  cancelBtn.addEventListener('click', handleCancel);

  await initializePopup();
});
