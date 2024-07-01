// Use on this URL: https://www.youtube.com/feed/history
let videos = document.querySelectorAll("ytd-video-renderer");
let japaneseRegex = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FBF]/;

videos.forEach(video => {
    let titleElement = video.querySelector("#video-title");
    if (!titleElement) {
        return;
    }

    let title = titleElement.textContent;
    let videoText = video.textContent;
    if (!japaneseRegex.test(videoText)) {
        console.log("Could not find Japanese video...");
        return;
    }

    console.log(`Found Japanese video: ${title}`);
    let removeButton = video.querySelector(".yt-spec-touch-feedback-shape__fill");
    if (!removeButton) {
        console.log(`Couldn't find Japanese video: ${title}...`);
        return;
    }

    removeButton.click();
    console.log(`Removed Japanese video: ${title}`);
});