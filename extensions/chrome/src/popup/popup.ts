import { isValidUrl } from '@monorepo/shared';

document.getElementById('save-bookmark')?.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const status = document.getElementById('status');

  if (tab.url && isValidUrl(tab.url)) {
    const bookmark = {
      url: tab.url,
      title: tab.title || 'Untitled',
      tagIds: [],
    };

    console.log('Saving bookmark:', bookmark);

    if (status) {
      status.textContent = 'Bookmark saved!';
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
    }
  } else {
    if (status) {
      status.textContent = 'Invalid URL';
    }
  }
});
