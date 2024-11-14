chrome.action.onClicked.addListener((tab) => {
  const urlsToOpen = [
    "https://myactivity.google.com/product/youtube",
    "https://www.youtube.com/feed/history"
  ];

  urlsToOpen.forEach((url) => {
    chrome.tabs.create({ url: url });
  });
});
