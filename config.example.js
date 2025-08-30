// Configuration example for LinkMark Chrome Extension
// Copy this file to config.js and update with your actual values

const CONFIG = {
    // Google OAuth Configuration
    GOOGLE_CLIENT_ID: 'your-google-client-id.apps.googleusercontent.com',

    // Backend API Configuration
    API_BASE_URL: 'https://your-backend-api.com/api',

    // Extension Configuration
    DEFAULT_CATEGORIES: [
        'Work',
        'Learning',
        'Shopping',
        'Entertainment',
        'News',
        'Research',
        'Tools',
        'Social'
    ],

    // UI Configuration
    MAX_CATEGORIES_HISTORY: 10,
    POPUP_WIDTH: 400,
    POPUP_HEIGHT: 500,

    // Development flags
    DEBUG_MODE: false,
    MOCK_API_CALLS: true // Set to true for testing without backend
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
