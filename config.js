// Configuration management for YouTube History Remover

// Default configuration
const DEFAULT_CONFIG = {
    regexPattern: '/[\\u3000-\\u303F\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FBF]/',
    targetUrls: {
        activityPage: true,
        feedPage: true
    },
    safety: {
        maxScrollAttempts: 50,
        scrollInterval: 8,
        contentLoadWait: 2,
        deletionTimeout: 5,
        pauseBetweenRemovals: 500
    },
    behavior: {
        autoStart: true,
        logLevel: 'normal'
    }
};

// Preset regex patterns
const PRESET_PATTERNS = {
    japanese: '/[\\u3000-\\u303F\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FBF]/'
};

// Initialize the configuration page
document.addEventListener('DOMContentLoaded', function () {
    loadConfiguration();
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    document.getElementById('configForm').addEventListener('submit', saveConfiguration);

    // Add input validation
    document.getElementById('regexPattern').addEventListener('input', validateRegex);

    // Add reset button event listener
    document.getElementById('resetButton').addEventListener('click', resetToDefaults);
}

// Load configuration from storage
async function loadConfiguration() {
    try {
        const result = await chrome.storage.sync.get('config');
        const config = result.config || DEFAULT_CONFIG;

        // Populate form fields
        document.getElementById('regexPattern').value = config.regexPattern || DEFAULT_CONFIG.regexPattern;
        document.getElementById('activityPage').checked = config.targetUrls?.activityPage ?? DEFAULT_CONFIG.targetUrls.activityPage;
        document.getElementById('feedPage').checked = config.targetUrls?.feedPage ?? DEFAULT_CONFIG.targetUrls.feedPage;

        // Safety settings
        document.getElementById('maxScrollAttempts').value = config.safety?.maxScrollAttempts ?? DEFAULT_CONFIG.safety.maxScrollAttempts;
        document.getElementById('scrollInterval').value = config.safety?.scrollInterval ?? DEFAULT_CONFIG.safety.scrollInterval;
        document.getElementById('contentLoadWait').value = config.safety?.contentLoadWait ?? DEFAULT_CONFIG.safety.contentLoadWait;
        document.getElementById('deletionTimeout').value = config.safety?.deletionTimeout ?? DEFAULT_CONFIG.safety.deletionTimeout;
        document.getElementById('pauseBetweenRemovals').value = config.safety?.pauseBetweenRemovals ?? DEFAULT_CONFIG.safety.pauseBetweenRemovals;

        // Behavior settings
        document.getElementById('autoStart').checked = config.behavior?.autoStart ?? DEFAULT_CONFIG.behavior.autoStart;
        document.getElementById('logLevel').value = config.behavior?.logLevel ?? DEFAULT_CONFIG.behavior.logLevel;

        showStatus('Configuration loaded successfully!', 'success');
    } catch (error) {
        console.error('Error loading configuration:', error);
        showStatus('Error loading configuration. Using defaults.', 'error');
    }
}

// Save configuration to storage
async function saveConfiguration(event) {
    event.preventDefault();

    try {
        const config = {
            regexPattern: document.getElementById('regexPattern').value,
            targetUrls: {
                activityPage: document.getElementById('activityPage').checked,
                feedPage: document.getElementById('feedPage').checked
            },
            safety: {
                maxScrollAttempts: parseInt(document.getElementById('maxScrollAttempts').value),
                scrollInterval: parseFloat(document.getElementById('scrollInterval').value),
                contentLoadWait: parseFloat(document.getElementById('contentLoadWait').value),
                deletionTimeout: parseInt(document.getElementById('deletionTimeout').value),
                pauseBetweenRemovals: parseInt(document.getElementById('pauseBetweenRemovals').value)
            },
            behavior: {
                autoStart: document.getElementById('autoStart').checked,
                logLevel: document.getElementById('logLevel').value
            }
        };

        // Validate configuration
        if (!validateConfiguration(config)) {
            return;
        }

        await chrome.storage.sync.set({ config: config });
        showStatus('Configuration saved successfully!', 'success');

        // Notify content scripts about configuration change
        notifyContentScripts(config);

    } catch (error) {
        console.error('Error saving configuration:', error);
        showStatus('Error saving configuration.', 'error');
    }
}

// Validate configuration
function validateConfiguration(config) {
    // Validate regex pattern
    try {
        new RegExp(config.regexPattern.slice(1, -1)); // Remove / / delimiters
    } catch (error) {
        showStatus('Invalid regex pattern: ' + error.message, 'error');
        return false;
    }

    // Validate numeric values
    if (config.safety.maxScrollAttempts < 10 || config.safety.maxScrollAttempts > 200) {
        showStatus('Max scroll attempts must be between 10 and 200', 'error');
        return false;
    }

    if (config.safety.scrollInterval < 1 || config.safety.scrollInterval > 30) {
        showStatus('Scroll interval must be between 1 and 30 seconds', 'error');
        return false;
    }

    return true;
}

// Validate regex pattern in real-time
function validateRegex(event) {
    const pattern = event.target.value;
    if (!pattern) return;

    try {
        new RegExp(pattern.slice(1, -1));
        event.target.style.borderColor = '#4CAF50';
    } catch (error) {
        event.target.style.borderColor = '#f44336';
    }
}

// Set preset regex patterns
function setPreset(type) {
    const pattern = PRESET_PATTERNS[type];
    if (pattern) {
        document.getElementById('regexPattern').value = pattern;
        validateRegex({ target: document.getElementById('regexPattern') });
    }
}

// Reset to default configuration
function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        const config = DEFAULT_CONFIG;

        document.getElementById('regexPattern').value = config.regexPattern;
        document.getElementById('activityPage').checked = config.targetUrls.activityPage;
        document.getElementById('feedPage').checked = config.targetUrls.feedPage;

        document.getElementById('maxScrollAttempts').value = config.safety.maxScrollAttempts;
        document.getElementById('scrollInterval').value = config.safety.scrollInterval;
        document.getElementById('contentLoadWait').value = config.safety.contentLoadWait;
        document.getElementById('deletionTimeout').value = config.safety.deletionTimeout;
        document.getElementById('pauseBetweenRemovals').value = config.safety.pauseBetweenRemovals;

        document.getElementById('autoStart').checked = config.behavior.autoStart;
        document.getElementById('logLevel').value = config.behavior.logLevel;

        showStatus('Configuration reset to defaults!', 'success');
    }
}

// Notify content scripts about configuration change
async function notifyContentScripts(config) {
    try {
        const tabs = await chrome.tabs.query({
            url: [
                "https://myactivity.google.com/product/youtube",
                "https://www.youtube.com/feed/history"
            ]
        });

        for (const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, {
                action: 'configUpdated',
                config: config
            }).catch(() => {
                // Ignore errors if content script is not loaded
            });
        }
    } catch (error) {
        console.error('Error notifying content scripts:', error);
    }
}

// Show status message
function showStatus(message, type) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
    statusElement.style.display = 'block';

    setTimeout(() => {
        statusElement.style.display = 'none';
    }, 3000);
} 