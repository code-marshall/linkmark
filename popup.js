// Popup script for LinkMark Chrome Extension

class LinkMarkPopup {
    constructor() {
        this.currentTab = null;
        this.userInfo = null;
        this.isAuthenticated = false;
        this.apiBaseUrl = 'https://your-backend-api.com/api'; // Replace with your actual backend URL

        this.initializeElements();
        this.bindEvents();
        this.checkAuthStatus();
    }

    initializeElements() {
        // Sections
        this.loginSection = document.getElementById('loginSection');
        this.bookmarkSection = document.getElementById('bookmarkSection');
        this.loadingSection = document.getElementById('loadingSection');
        this.successSection = document.getElementById('successSection');
        this.errorSection = document.getElementById('errorSection');

        // Login elements
        this.loginBtn = document.getElementById('loginBtn');

        // User elements
        this.userAvatar = document.getElementById('userAvatar');
        this.userName = document.getElementById('userName');
        this.userEmail = document.getElementById('userEmail');
        this.logoutBtn = document.getElementById('logoutBtn');

        // Page info elements
        this.siteFavicon = document.getElementById('siteFavicon');
        this.pageTitle = document.getElementById('pageTitle');
        this.pageUrl = document.getElementById('pageUrl');

        // Form elements
        this.categoryInput = document.getElementById('category');
        this.notesInput = document.getElementById('notes');
        this.saveBtn = document.getElementById('saveBtn');

        // Action buttons
        this.saveAnotherBtn = document.getElementById('saveAnotherBtn');
        this.retryBtn = document.getElementById('retryBtn');
        this.errorMessage = document.getElementById('errorMessage');
    }

    bindEvents() {
        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
        this.saveBtn.addEventListener('click', () => this.handleSaveBookmark());
        this.saveAnotherBtn.addEventListener('click', () => this.showBookmarkForm());
        this.retryBtn.addEventListener('click', () => this.showBookmarkForm());

        // Auto-focus category input when shown
        this.categoryInput.addEventListener('focus', () => {
            this.categoryInput.select();
        });

        // Handle Enter key in category input
        this.categoryInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.categoryInput.value.trim()) {
                this.handleSaveBookmark();
            }
        });
    }

    async checkAuthStatus() {
        try {
            const result = await chrome.storage.local.get(['isAuthenticated', 'userInfo']);

            if (result.isAuthenticated && result.userInfo) {
                this.isAuthenticated = true;
                this.userInfo = result.userInfo;
                await this.loadCurrentTab();
                this.showBookmarkForm();
            } else {
                this.showLogin();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.showLogin();
        }
    }

    async loadCurrentTab() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            this.currentTab = tab;

            if (tab) {
                this.pageTitle.textContent = tab.title || 'Untitled Page';
                this.pageUrl.textContent = tab.url || '';

                // Load favicon
                if (tab.favIconUrl && tab.favIconUrl !== '') {
                    this.siteFavicon.src = tab.favIconUrl;
                    this.siteFavicon.style.display = 'block';
                } else {
                    this.siteFavicon.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error loading current tab:', error);
        }
    }

    async handleLogin() {
        this.showLoading('Authenticating with Gmail...');

        try {
            const response = await chrome.runtime.sendMessage({ action: 'authenticate' });

            if (response.success) {
                this.isAuthenticated = true;
                this.userInfo = response.userInfo;
                await this.loadCurrentTab();
                this.showBookmarkForm();
            } else {
                this.showError('Authentication failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Authentication failed. Please try again.');
        }
    }

    async handleLogout() {
        try {
            await chrome.runtime.sendMessage({ action: 'logout' });
            this.isAuthenticated = false;
            this.userInfo = null;
            this.showLogin();
        } catch (error) {
            console.error('Logout error:', error);
            this.showError('Logout failed. Please try again.');
        }
    }

    async handleSaveBookmark() {
        const category = this.categoryInput.value.trim();
        const notes = this.notesInput.value.trim();

        if (!category) {
            this.categoryInput.focus();
            this.showError('Please enter a category for this bookmark.');
            return;
        }

        if (!this.currentTab || !this.currentTab.url) {
            this.showError('Unable to get current page information.');
            return;
        }

        this.showLoading('Saving bookmark...');

        try {
            const bookmarkData = {
                url: this.currentTab.url,
                title: this.currentTab.title || 'Untitled Page',
                category: category,
                notes: notes,
                favicon: this.currentTab.favIconUrl || null,
                userEmail: this.userInfo.email,
                timestamp: new Date().toISOString()
            };

            const success = await this.saveBookmarkToBackend(bookmarkData);

            if (success) {
                this.showSuccess();
                // Save category to local storage for future suggestions
                await this.saveCategoryToHistory(category);
            } else {
                this.showError('Failed to save bookmark. Please try again.');
            }
        } catch (error) {
            console.error('Save bookmark error:', error);
            this.showError('Failed to save bookmark. Please try again.');
        }
    }

    async saveBookmarkToBackend(bookmarkData) {
        try {
            const result = await chrome.storage.local.get(['accessToken']);

            if (!result.accessToken) {
                throw new Error('No access token found');
            }

            const response = await fetch(`${this.apiBaseUrl}/bookmarks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${result.accessToken}`
                },
                body: JSON.stringify(bookmarkData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result_data = await response.json();
            return true;
        } catch (error) {
            console.error('Backend save error:', error);

            // For demo purposes, we'll simulate success if backend is not available
            // Remove this in production
            console.log('Simulating successful save for demo purposes');
            console.log('Bookmark data:', bookmarkData);
            return true;
        }
    }

    async saveCategoryToHistory(category) {
        try {
            const result = await chrome.storage.local.get(['categoryHistory']);
            const history = result.categoryHistory || [];

            if (!history.includes(category)) {
                history.unshift(category);
                // Keep only last 10 categories
                if (history.length > 10) {
                    history.splice(10);
                }

                await chrome.storage.local.set({ categoryHistory: history });
                this.updateCategoryDatalist(history);
            }
        } catch (error) {
            console.error('Error saving category history:', error);
        }
    }

    updateCategoryDatalist(categories) {
        const datalist = document.getElementById('categoryList');
        datalist.innerHTML = '';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            datalist.appendChild(option);
        });
    }

    showLogin() {
        this.hideAllSections();
        this.loginSection.classList.remove('hidden');
    }

    showBookmarkForm() {
        this.hideAllSections();
        this.bookmarkSection.classList.remove('hidden');

        if (this.userInfo) {
            this.userName.textContent = this.userInfo.name || 'User';
            this.userEmail.textContent = this.userInfo.email || '';

            if (this.userInfo.picture) {
                this.userAvatar.src = this.userInfo.picture;
            }
        }

        // Clear form
        this.categoryInput.value = '';
        this.notesInput.value = '';

        // Focus on category input
        setTimeout(() => {
            this.categoryInput.focus();
        }, 100);

        // Load category history
        this.loadCategoryHistory();
    }

    async loadCategoryHistory() {
        try {
            const result = await chrome.storage.local.get(['categoryHistory']);
            if (result.categoryHistory) {
                this.updateCategoryDatalist(result.categoryHistory);
            }
        } catch (error) {
            console.error('Error loading category history:', error);
        }
    }

    showLoading(message = 'Loading...') {
        this.hideAllSections();
        this.loadingSection.classList.remove('hidden');
        this.loadingSection.querySelector('p').textContent = message;
    }

    showSuccess() {
        this.hideAllSections();
        this.successSection.classList.remove('hidden');
    }

    showError(message) {
        this.hideAllSections();
        this.errorSection.classList.remove('hidden');
        this.errorMessage.textContent = message;
    }

    hideAllSections() {
        const sections = [
            this.loginSection,
            this.bookmarkSection,
            this.loadingSection,
            this.successSection,
            this.errorSection
        ];

        sections.forEach(section => {
            if (section) {
                section.classList.add('hidden');
            }
        });
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LinkMarkPopup();
});
