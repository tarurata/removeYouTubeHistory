// URL: https://myactivity.google.com/product/youtube
function removeJapaneseSearchHistory() {
    let activityCards = document.querySelectorAll("c-wiz");
    let japaneseRegex = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FBF]/;

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
            console.log(`${videoText} Removed!`);
        } else {
            console.log(`${videoText} couldn't be removed...`);
        }
    });
}

setInterval(removeJapaneseSearchHistory, 5000);
removeJapaneseSearchHistory();