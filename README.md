# Remove History in YouTube

A Chrome extension that automatically removes content from your YouTube watch history based on customizable regex patterns to prevent YouTube from recommending unwanted videos based on your viewing history.

## 🎯 Purpose

YouTube's recommendation algorithm uses your watch history to suggest new videos. If you've watched content in the past that you no longer want to see, YouTube will continue recommending similar videos. This extension helps you clean up your YouTube history by automatically removing content that matches your custom patterns.

## ✨ Features

- **Customizable Detection**: Identifies content using user-defined regex patterns
- **Auto-Scrolling**: Automatically scrolls through your entire YouTube history to load more content
- **Dual Platform Support**: Works on both YouTube Activity page and YouTube Feed History
- **Safety Mechanisms**: Prevents infinite scrolling and includes error handling
- **Real-time Removal**: Removes matching content as it's discovered
- **Web Configuration**: Easy-to-use web interface for all settings

## 🚀 Installation

### Method 1: Load Unpacked Extension (Development)

1. **Download the Extension**
   ```bash
   git clone https://github.com/tarurata/removeYouTubeHistory.git
   cd removeYouTubeHistory
   ```

2. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `removeYouTubeHistory` folder
   - The extension should now appear in your extensions list

### Method 2: Install from Chrome Web Store (Coming Soon)

*Note: This extension is not yet available on the Chrome Web Store*

## 📖 How to Use

### Step 1: Configure the Extension
- Click the extension icon in your Chrome toolbar
- This will open the configuration page
- Set your desired regex pattern for content detection
- Configure safety settings and behavior options
- Click "Save Configuration"

### Step 2: Open History Pages
- Right-click the extension icon and select "Open YouTube History Pages"
- This will automatically open two tabs:
  - YouTube Activity page (`https://myactivity.google.com/product/youtube`)
  - YouTube Feed History page (`https://www.youtube.com/feed/history`)

### Step 3: Let It Run
- The extension will automatically start scanning for matching content
- It will scroll through your history to load more content
- Matching videos and search history will be automatically removed
- You can minimize the tabs or switch to other tabs - it works in the background

### Step 4: Monitor Progress
- Check the browser console (F12) to see the removal progress
- The extension will log:
  - Found matching content
  - Successful removals
  - Scroll progress
  - Any errors encountered

## 🔧 How It Works

### Content Detection
The extension uses customizable regex patterns to identify content:
- **Default Pattern**: Detects Hiragana, Katakana, Kanji, and Japanese punctuation
- **Custom Patterns**: You can define any regex pattern to match your desired content
- **Real-time Validation**: Regex patterns are validated as you type

### Automatic Scrolling
- Scrolls to the bottom of the page to load more content
- Detects when new content is loaded by comparing page heights
- Continues scrolling until no new content is found
- Includes safety mechanisms to prevent infinite scrolling

### Removal Process
1. **Scan**: Identifies YouTube activity cards with matching content
2. **Click**: Automatically clicks the delete button for each item
3. **Confirm**: Waits for deletion confirmation
4. **Continue**: Moves to the next item

## 📁 File Structure

```
removeYouTubeHistory/
├── manifest.json              # Extension configuration
├── background.js              # Background script (opens tabs)
├── removeHistoryInActivity.js # Removes from YouTube Activity page
├── removeHistoryInFeed.js     # Removes from YouTube Feed History
├── config.html                # Configuration web interface
├── config.js                  # Configuration management
├── icon.png                   # Extension icon
└── README.md                  # This file
```

## ⚙️ Configuration

### Content Detection
- **Regex Pattern**: Customizable pattern for content detection
- **Target Pages**: Choose which pages to process (Activity, Feed, or both)

### Safety Settings
- **Max Scroll Attempts**: 50 (prevents infinite scrolling)
- **Scroll Interval**: 8 seconds between operations
- **Content Load Wait**: 2 seconds for new content to load
- **Deletion Timeout**: 5 seconds for deletion confirmation
- **Pause Between Removals**: 500ms delay between removing items

### Behavior Settings
- **Auto-start**: Whether to start automatically when pages load
- **Log Level**: Console logging verbosity (minimal, normal, detailed)

### Supported URLs
- `https://myactivity.google.com/product/youtube`
- `https://www.youtube.com/feed/history`

## 🛡️ Safety Features

- **Overlap Prevention**: Won't start new operations if one is already running
- **Error Handling**: Graceful handling of network errors and missing elements
- **Timeout Protection**: Prevents hanging on slow-loading content
- **Memory Management**: Efficient cleanup of event listeners
- **Regex Validation**: Real-time validation of regex patterns

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## ⚠️ Disclaimer

This extension is for personal use to manage your own YouTube history. Please use responsibly and in accordance with YouTube's Terms of Service. The extension only removes content from your own history and does not affect other users.

---

**Note**: This extension is not affiliated with YouTube or Google. Use at your own discretion.