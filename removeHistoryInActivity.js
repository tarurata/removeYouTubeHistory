// TODO May be able to remove directly click the button from aria-label="Delete activity item 中東戦争になるかもねー。アサヒマルエフを呑みながら 2024/08/03 S20"
// TODO Auto scroll to show the old history
// URL: https://myactivity.google.com/product/youtube

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

function waitForDeletionConfirmation(element, timeout) {
    return new Promise((resolve) => {
        // Watch for the card element to be removed from the DOM
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

async function removeMatchingSearchHistory() {
    let contentRegex;

    try {
        const pattern = config.regexPattern.slice(1, -1);
        contentRegex = new RegExp(pattern);
    } catch (error) {
        log(`Invalid regex pattern: ${error.message}`, 'normal');
        return 0;
    }

    let removedCount = 0;
    // Snapshot so DOM mutations during removal don't affect iteration
    let activityCards = Array.from(document.querySelectorAll("c-wiz"));

    for (const element of activityCards) {
        // Skip elements already removed from DOM by a previous iteration
        if (!document.contains(element)) continue;

        if (!element.firstElementChild || !element.firstElementChild.getAttribute("aria-label")) continue;
        if (!element.firstElementChild.getAttribute("aria-label").includes("Card showing an activity from YouTube")) continue;

        let videoText = element.textContent.trim();
        if (!contentRegex.test(videoText)) {
            log("Could not find matching content...", 'detailed');
            continue;
        }

        log(`Found matching search: ${videoText}`, 'normal');

        let removeButton = element.querySelector("button");

        if (removeButton) {
            removeButton.click();
            // Wait for the card to actually disappear from the DOM
            const removed = await waitForDeletionConfirmation(element, config.safety.deletionTimeout);
            if (removed) {
                log(`${videoText} Removed!`, 'normal');
                removedCount++;
            } else {
                log(`Delete timed out for: ${videoText}`, 'normal');
            }

            if (config.safety.pauseBetweenRemovals > 0) {
                await new Promise(resolve => setTimeout(resolve, config.safety.pauseBetweenRemovals));
            }
        } else {
            log(`${videoText} couldn't be removed...`, 'normal');
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
        log("Checking current view for matching history...", 'normal');
        const removedCount = await removeMatchingSearchHistory();

        if (removedCount > 0) {
            log(`Removed ${removedCount} items from current view`, 'normal');
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

        log("Checking newly loaded content for matching history...", 'normal');
        const newRemovedCount = await removeMatchingSearchHistory();

        if (newRemovedCount > 0) {
            log(`Removed ${newRemovedCount} items from newly loaded content`, 'normal');
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
        log("Starting automatic history removal...", 'normal');
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