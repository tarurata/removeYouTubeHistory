// Use on this URL: https://myactivity.google.com/product/youtube?hl=en&utm_medium=web&utm_source=youtube
let searchHistoryElements = document.querySelectorAll("div.k2bP7e.YYajNd");
let japaneseRegex = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FBF]/;

searchHistoryElements.forEach(element => {
    if (!element.textContent.includes("Searched for")) {
        return;
    }

    let linkElement = element.querySelector("a");
    if (!linkElement) {
        return;
    }

    let linkText = linkElement.textContent;
    // Check if the text contains Japanese characters
    if (!japaneseRegex.test(linkText)) {
        console.log("Could not find Japanese...");
        return;
    }

    console.log(`Found Japanese search: ${linkText}`);
    let removeButton = element.querySelector("button");

    if (removeButton) {
        removeButton.click();
        console.log(`${linkText} Removed!`);
    } else {
        console.log(`${linkText} couldn't be removed...`);
    }
});