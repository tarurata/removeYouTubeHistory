// Use on this URL: https://www.youtube.com/feed/history

// Configuration management
let config = {
    regexPattern: '/[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FBF]/',
    safety: {
        maxScrollAttempts: 50,
        scrollInterval: 8000,
        contentLoadWait: 2000,
        deletionTimeout: 5000,
        pauseBetweenRemovals: 500
    },
    behavior: {
        autoStart: true,
        logLevel: 'normal'
    }
};

let isScrolling = false;
let scrollAttempts = 0;
let isRunning = false;

// Load configuration from storage
async function loadConfig() {
    try {
        const result = await chrome.storage.sync.get('config');
        if (result.config) {
            config = { ...config, ...result.config };
            // Convert seconds to milliseconds for internal use
            config.safety.scrollInterval = config.safety.scrollInterval * 1000;
            config.safety.contentLoadWait = config.safety.contentLoadWait * 1000;
            config.safety.deletionTimeout = config.safety.deletionTimeout * 1000;
        }
        log('Configuration loaded', 'detailed');
    } catch (error) {
        log('Error loading configuration, using defaults', 'normal');
    }
}

// Logging function with configurable levels
function log(message, level = 'normal') {
    const levels = { minimal: 0, normal: 1, detailed: 2 };
    const currentLevel = levels[config.behavior.logLevel] || 1;
    const messageLevel = levels[level] || 1;

    if (messageLevel <= currentLevel) {
        console.log(`[YouTube History Remover] ${message}`);
    }
}

// Listen for configuration updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'configUpdated') {
        config = { ...config, ...message.config };
        // Convert seconds to milliseconds for internal use
        config.safety.scrollInterval = config.safety.scrollInterval * 1000;
        config.safety.contentLoadWait = config.safety.contentLoadWait * 1000;
        config.safety.deletionTimeout = config.safety.deletionTimeout * 1000;
        log('Configuration updated', 'normal');
    }
});

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
                log(`New content loaded, height increased from ${currentHeight} to ${newHeight}`, 'detailed');
                scrollAttempts = 0; // Reset attempts since we found new content
            } else {
                scrollAttempts++;
                log(`No new content loaded, attempt ${scrollAttempts} of ${config.safety.maxScrollAttempts}`, 'detailed');
            }

            resolve();
        }, config.safety.contentLoadWait);
    });
}

function waitForElementRemoval(element, timeout) {
    return new Promise((resolve) => {
        const observer = new MutationObserver(() => {
            if (!document.contains(element)) {
                observer.disconnect();
                resolve(true);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => {
            observer.disconnect();
            resolve(false);
        }, timeout);
    });
}

async function removeMatchingVideoHistory() {
    let contentRegex;

    try {
        const pattern = config.regexPattern.slice(1, -1);
        contentRegex = new RegExp(pattern);
    } catch (error) {
        log(`Invalid regex pattern: ${error.message}`, 'normal');
        return 0;
    }

    let removedCount = 0;
    // Snapshot the list so mutations during removal don't affect iteration
    let videos = Array.from(document.querySelectorAll("ytd-video-renderer"));

    for (const video of videos) {
        // Skip elements already removed from DOM by a previous iteration
        if (!document.contains(video)) continue;

        let titleElement = video.querySelector("#video-title");
        if (!titleElement) {
            log("Couldn't find title element...", 'detailed');
            continue;
        }

        let title = titleElement.textContent.trim();
        let videoText = video.textContent;
        if (!contentRegex.test(videoText)) {
            log("Could not find matching video...", 'detailed');
            continue;
        }

        log(`Found matching video: ${title}`, 'normal');

        let removeButton = video.querySelector(".yt-spec-touch-feedback-shape__fill");

        if (removeButton) {
            removeButton.click();
            // Wait for the element to actually be removed from the DOM
            const removed = await waitForElementRemoval(video, config.safety.deletionTimeout);
            if (removed) {
                log(`Removed matching video: ${title}`, 'normal');
                removedCount++;
            } else {
                log(`Delete timed out for: ${title}`, 'normal');
            }

            if (config.safety.pauseBetweenRemovals > 0) {
                await new Promise(resolve => setTimeout(resolve, config.safety.pauseBetweenRemovals));
            }
        } else {
            log(`Couldn't find remove button for: ${title}`, 'normal');
        }
    }

    return removedCount;
}

async function autoScrollAndRemove() {
    if (isScrolling || !isRunning) {
        log("Already scrolling or not running, skipping...", 'detailed');
        return;
    }

    isScrolling = true;

    try {
        log("Checking current view for matching videos...", 'normal');
        const removedCount = await removeMatchingVideoHistory();

        if (removedCount > 0) {
            log(`Removed ${removedCount} videos from current view`, 'normal');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        if (scrollAttempts >= config.safety.maxScrollAttempts) {
            log("Reached maximum scroll attempts, stopping auto-scroll", 'normal');
            isScrolling = false;
            isRunning = false;
            return;
        }

        log("Scrolling to load more content...", 'normal');
        await scrollToBottom();

        log("Checking newly loaded content for matching videos...", 'normal');
        const newRemovedCount = await removeMatchingVideoHistory();

        if (newRemovedCount > 0) {
            log(`Removed ${newRemovedCount} videos from newly loaded content`, 'normal');
        }

    } catch (error) {
        log(`Error during auto-scroll and remove: ${error.message}`, 'normal');
    } finally {
        isScrolling = false;
    }
}

// Start the process
async function startRemoval() {
    await loadConfig();

    if (config.behavior.autoStart) {
        isRunning = true;
        log("Starting automatic video removal...", 'normal');
        setInterval(autoScrollAndRemove, config.safety.scrollInterval);
        autoScrollAndRemove(); // Initial run
    } else {
        log("Auto-start disabled. Use context menu or console to start manually.", 'normal');
    }
}

// Manual start function
window.startYouTubeHistoryRemoval = function () {
    isRunning = true;
    log("Manual start triggered", 'normal');
    setInterval(autoScrollAndRemove, config.safety.scrollInterval);
    autoScrollAndRemove();
};

// Manual stop function
window.stopYouTubeHistoryRemoval = function () {
    isRunning = false;
    log("Manual stop triggered", 'normal');
};

// Start the process
startRemoval();