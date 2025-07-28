# Remove Japanese History in YouTube

A Chrome extension that automatically removes Japanese content from your YouTube watch history to prevent YouTube from recommending Japanese videos based on your viewing history.

## 🎯 Purpose

YouTube's recommendation algorithm uses your watch history to suggest new videos. If you've watched Japanese content in the past, YouTube will continue recommending Japanese videos even if you no longer want to see them. This extension helps you clean up your YouTube history by automatically removing Japanese content.

## ✨ Features

- **Automatic Detection**: Identifies Japanese content using Unicode character detection with Regex
- **Auto-Scrolling**: Automatically scrolls through your entire YouTube history to load more content
- **Dual Platform Support**: Works on both YouTube Activity page and YouTube Feed History
- **Real-time Removal**: Removes Japanese content as it's discovered

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

### Step 1: Open the Extension
- Click the extension icon in your Chrome toolbar
- This will automatically open two tabs:
  - YouTube Activity page (`https://myactivity.google.com/product/youtube`)
  - YouTube Feed History page (`https://www.youtube.com/feed/history`)

### Step 2: Let It Run
- The extension will automatically start scanning for Japanese content
- It will scroll through your history to load more content
- Japanese videos and search history will be automatically removed
- You can minimize the tabs or switch to other tabs - it works in the background

### Step 3: Monitor Progress
- Check the browser console (F12) to see the removal progress
- The extension will log:
  - Found Japanese content
  - Successful removals
  - Scroll progress
  - Any errors encountered

## 🔧 How It Works

### Content Detection
The extension uses Unicode character detection to identify Japanese content:
- **Hiragana**: `\u3040-\u309F`
- **Katakana**: `\u30A0-\u30FF`
- **Kanji**: `\u4E00-\u9FBF`
- **Japanese Punctuation**: `\u3000-\u303F`

### Automatic Scrolling
- Scrolls to the bottom of the page to load more content
- Detects when new content is loaded by comparing page heights
- Continues scrolling until no new content is found
- Includes safety mechanisms to prevent infinite scrolling

### Removal Process
1. **Scan**: Identifies YouTube activity cards with Japanese content
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
├── icon.png                   # Extension icon
└── README.md                  # This file
```

## ⚙️ Configuration

### Safety Settings
- **Max Scroll Attempts**: 50 (prevents infinite scrolling)
- **Scroll Interval**: 8 seconds between operations
- **Content Load Wait**: 2 seconds for new content to load
- **Deletion Timeout**: 5 seconds for deletion confirmation

### Supported URLs
- `https://myactivity.google.com/product/youtube`
- `https://www.youtube.com/feed/history`

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## ⚠️ Disclaimer

This extension is for personal use to manage your own YouTube history. Please use responsibly and in accordance with YouTube's Terms of Service. The extension only removes content from your own history and does not affect other users.

---

**Note**: This extension is not affiliated with YouTube or Google. Use at your own discretion.