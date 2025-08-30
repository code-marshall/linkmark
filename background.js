// Background script for LinkMark Chrome Extension

// Handle OAuth authentication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'authenticate') {
        performOAuth()
            .then(userInfo => {
                sendResponse({ success: true, userInfo });
            })
            .catch(error => {
                console.error('OAuth failed:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Will respond asynchronously
    }

    if (request.action === 'logout') {
        logout()
            .then(() => {
                sendResponse({ success: true });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        return true; // Will respond asynchronously
    }
});

async function performOAuth() {
    try {
        // Get OAuth token using Chrome Identity API
        const token = await new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: true }, (token) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(token);
                }
            });
        });

        // Get user info from Google API
        const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`);

        if (!response.ok) {
            throw new Error('Failed to get user info');
        }

        const userInfo = await response.json();

        // Store user info and token
        await chrome.storage.local.set({
            accessToken: token,
            userInfo: userInfo,
            isAuthenticated: true
        });

        return userInfo;
    } catch (error) {
        console.error('OAuth error:', error);
        throw error;
    }
}

async function logout() {
    try {
        // Get the current token
        const result = await chrome.storage.local.get(['accessToken']);

        if (result.accessToken) {
            // Revoke the token
            await new Promise((resolve, reject) => {
                chrome.identity.removeCachedAuthToken({ token: result.accessToken }, () => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve();
                    }
                });
            });
        }

        // Clear stored data
        await chrome.storage.local.clear();
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('LinkMark extension installed');
});
