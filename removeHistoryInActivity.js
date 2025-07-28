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

function removeJapaneseSearchHistory() {
    let activityCards = document.querySelectorAll("c-wiz");
    let japaneseRegex;

    try {
        // Create regex from config pattern (remove / / delimiters)
        const pattern = config.regexPattern.slice(1, -1);
        japaneseRegex = new RegExp(pattern);
    } catch (error) {
        log(`Invalid regex pattern: ${error.message}`, 'normal');
        return 0;
    }

    let removedCount = 0;

    activityCards.forEach(element => {
        // Check if the card is a YouTube activity card (including the search history)
        if (!element.firstElementChild.getAttribute("aria-label")) { return; }
        if (!element.firstElementChild.getAttribute("aria-label").includes("Card showing an activity from YouTube")) { return; }

        let videoText = element.textContent;
        // Check if the text contains Japanese characters
        if (!japaneseRegex.test(videoText)) {
            log("Could not find Japanese...", 'detailed');
            return;
        }

        log(`Found Japanese search: ${videoText}`, 'normal');

        let removeButton = element.querySelector("button");

        if (removeButton) {
            removeButton.click();

            // Wait for the deletion confirmation text to appear
            const waitForDeletion = new Promise((resolve) => {
                const checkDeletion = setInterval(() => {
                    const deletionText = document.querySelector('div[aria-live="polite"]');
                    if (deletionText && deletionText.textContent.includes('1 item delete')) {
                        clearInterval(checkDeletion);
                        resolve();
                    }
                }, 100);

                // Timeout after configured time
                setTimeout(() => {
                    clearInterval(checkDeletion);
                    resolve();
                }, config.safety.deletionTimeout);
            });

            waitForDeletion.then(() => {
                log(`${videoText} Removed!`, 'normal');
                removedCount++;
            });

            // Pause between removals
            if (config.safety.pauseBetweenRemovals > 0) {
                return new Promise(resolve => setTimeout(resolve, config.safety.pauseBetweenRemovals));
            }
        } else {
            log(`${videoText} couldn't be removed...`, 'normal');
        }
    });

    return removedCount;
}

async function autoScrollAndRemove() {
    if (isScrolling || !isRunning) {
        log("Already scrolling or not running, skipping...", 'detailed');
        return;
    }

    isScrolling = true;

    try {
        // First, try to remove any Japanese history from current view
        log("Checking current view for Japanese history...", 'normal');
        const removedCount = removeJapaneseSearchHistory();

        if (removedCount > 0) {
            log(`Removed ${removedCount} items from current view`, 'normal');
            // Wait a bit after removing items before scrolling
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Check if we should stop scrolling
        if (scrollAttempts >= config.safety.maxScrollAttempts) {
            log("Reached maximum scroll attempts, stopping auto-scroll", 'normal');
            isScrolling = false;
            isRunning = false;
            return;
        }

        // Scroll to load more content
        log("Scrolling to load more content...", 'normal');
        await scrollToBottom();

        // Wait a bit for content to settle
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try to remove history from newly loaded content
        log("Checking newly loaded content for Japanese history...", 'normal');
        const newRemovedCount = removeJapaneseSearchHistory();

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
        log("Starting automatic Japanese history removal...", 'normal');
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