chrome.action.onClicked.addListener((tab) => {
  const urlsToOpen = [
    "https://myactivity.google.com/product/youtube",
  ];

  urlsToOpen.forEach((url) => {
    chrome.tabs.create({ url: url }, (newTab) => {
      chrome.scripting.executeScript({
        target: { tabId: newTab.id },
        files: [ removeHistoryInActivity.js ]
      });
    });
  });
});
