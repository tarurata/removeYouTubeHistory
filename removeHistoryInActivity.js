// TODO May be able to remove directly click the button from aria-label="Delete activity item 中東戦争になるかもねー。アサヒマルエフを呑みながら 2024/08/03 S20"
// TODO Auto scroll to show the old history
// URL: https://myactivity.google.com/product/youtube

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

function removeJapaneseSearchHistory() {
    let activityCards = document.querySelectorAll("c-wiz");

    let japaneseRegex = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FBF]/;
    let removedCount = 0;

    activityCards.forEach(element => {
        // Check if the card is a YouTube activity card (including the search history)
        if (!element.firstElementChild.getAttribute("aria-label")) { return; }
        if (!element.firstElementChild.getAttribute("aria-label").includes("Card showing an activity from YouTube")) { return; }

        let videoText = element.textContent;
        // Check if the text contains Japanese characters
        if (!japaneseRegex.test(videoText)) {
            console.log("Could not find Japanese...");
            return;
        }

        console.log(`Found Japanese search: ${videoText}`);
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

                // Timeout after 5 seconds
                setTimeout(() => {
                    clearInterval(checkDeletion);
                    resolve();
                }, 5000);
            });

            waitForDeletion.then(() => {
                console.log(`${videoText} Removed!`);
                removedCount++;
            });
        } else {
            console.log(`${videoText} couldn't be removed...`);
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
        // First, try to remove any Japanese history from current view
        console.log("Checking current view for Japanese history...");
        const removedCount = removeJapaneseSearchHistory();

        if (removedCount > 0) {
            console.log(`Removed ${removedCount} items from current view`);
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

        // Try to remove history from newly loaded content
        console.log("Checking newly loaded content for Japanese history...");
        const newRemovedCount = removeJapaneseSearchHistory();

        if (newRemovedCount > 0) {
            console.log(`Removed ${newRemovedCount} items from newly loaded content`);
        }

    } catch (error) {
        console.error("Error during auto-scroll and remove:", error);
    } finally {
        isScrolling = false;
    }
}

// Start the auto-scroll and remove process
setInterval(autoScrollAndRemove, 8000); // Run every 8 seconds
autoScrollAndRemove(); // Initial run