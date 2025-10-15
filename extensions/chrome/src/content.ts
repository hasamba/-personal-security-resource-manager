console.log('Content script loaded for:', window.location.href);

chrome.runtime.sendMessage({ type: 'GET_CONFIG' }, (response) => {
  console.log('Config received:', response);
});
