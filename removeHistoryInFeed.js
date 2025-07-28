// Use on this URL: https://www.youtube.com/feed/history

let isScrolling = false;
let scrollAttempts = 0;
const maxScrollAttempts = 50; // Prevent infinite scrolling

function scrollToBottom() {
    return new Promise((resolve) => {
        const currentHeight = document.documentElement.scrollHeight;

        // Scroll to bottom
        window.scrollTo(0, currentHeight);

        // Wait for new content to load
        setTimeout(() => {
            const newHeight = document.documentElement.scrollHeight;

            // If height increased, new content was loaded
            if (newHeight > currentHeight) {
                console.log("New content loaded, height increased from", currentHeight, "to", newHeight);
                scrollAttempts = 0; // Reset attempts since we found new content
            } else {
                scrollAttempts++;
                console.log("No new content loaded, attempt", scrollAttempts, "of", maxScrollAttempts);
            }

            resolve();
        }, 2000); // Wait 2 seconds for content to load
    });
}

function removeJapaneseVideoHistory() {
    let videos = document.querySelectorAll("ytd-video-renderer");
    let japaneseRegex = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FBF]/;
    let removedCount = 0;

    videos.forEach(video => {
        let titleElement = video.querySelector("#video-title");
        if (!titleElement) {
            console.log("Couldn't find title element...");
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

        if (removeButton) {
            removeButton.click();
            console.log(`Removed Japanese video: ${title}`);
            removedCount++;
        } else {
            console.log(`Couldn't find Japanese video: ${title}...`);
        }
    });

    return removedCount;
}

async function autoScrollAndRemove() {
    if (isScrolling) {
        console.log("Already scrolling, skipping...");
        return;
    }

    isScrolling = true;

    try {
        // First, try to remove any Japanese videos from current view
        console.log("Checking current view for Japanese videos...");
        const removedCount = removeJapaneseVideoHistory();

        if (removedCount > 0) {
            console.log(`Removed ${removedCount} videos from current view`);
            // Wait a bit after removing items before scrolling
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Check if we should stop scrolling
        if (scrollAttempts >= maxScrollAttempts) {
            console.log("Reached maximum scroll attempts, stopping auto-scroll");
            isScrolling = false;
            return;
        }

        // Scroll to load more content
        console.log("Scrolling to load more content...");
        await scrollToBottom();

        // Wait a bit for content to settle
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try to remove videos from newly loaded content
        console.log("Checking newly loaded content for Japanese videos...");
        const newRemovedCount = removeJapaneseVideoHistory();

        if (newRemovedCount > 0) {
            console.log(`Removed ${newRemovedCount} videos from newly loaded content`);
        }

    } catch (error) {
        console.error("Error during auto-scroll and remove:", error);
    } finally {
        isScrolling = false;
    }
}

// Start the auto-scroll and remove process
setInterval(autoScrollAndRemove, 8000);
autoScrollAndRemove();