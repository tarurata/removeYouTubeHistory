// Background script for YouTube History Remover

// Open configuration page when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  // Open configuration page
  chrome.tabs.create({ url: chrome.runtime.getURL('config.html') });
});

// Create context menu for quick access
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'openConfig',
    title: 'Open Configuration',
    contexts: ['action']
  });

  chrome.contextMenus.create({
    id: 'openHistoryPages',
    title: 'Open YouTube History Pages',
    contexts: ['action']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openConfig') {
    chrome.tabs.create({ url: chrome.runtime.getURL('config.html') });
  } else if (info.menuItemId === 'openHistoryPages') {
    const urlsToOpen = [
      "https://myactivity.google.com/product/youtube",
      "https://www.youtube.com/feed/history"
    ];

    urlsToOpen.forEach((url) => {
      chrome.tabs.create({ url: url });
    });
  }
});
