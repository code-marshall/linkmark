# LinkMark - Smart Bookmark Manager Chrome Extension

A powerful Chrome extension that allows you to bookmark web pages with categories using Gmail OAuth authentication. Save, organize, and sync your bookmarks across devices with a beautiful, modern interface.

## ✨ Features

- 🔐 **Gmail OAuth Authentication** - Secure login with your Google account
- 📚 **Categorized Bookmarks** - Organize bookmarks with custom categories
- 🎨 **Beautiful UI** - Modern, responsive design with smooth animations
- 💾 **Cloud Sync** - Save bookmarks to your backend for cross-device access
- 🏷️ **Smart Categories** - Auto-suggest previously used categories
- 📝 **Notes Support** - Add optional notes to your bookmarks
- 🔄 **Auto Page Detection** - Automatically captures page title, URL, and favicon
- ⚡ **Fast & Lightweight** - Minimal resource usage

## 🚀 Quick Start

### Prerequisites

1. Google Chrome browser
2. Google Cloud Console account (for OAuth setup)
3. Backend API (see [BACKEND.md](BACKEND.md) for options)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/linkmark.git
   cd linkmark
   ```

2. **Set up Google OAuth**
   - Follow the detailed instructions in [DEPLOYMENT.md](DEPLOYMENT.md)
   - Get your Google Client ID
   - Update `manifest.json` with your Client ID

3. **Configure Backend**
   - Choose a backend option from [BACKEND.md](BACKEND.md)
   - Update `popup.js` with your API URL
   - Update `manifest.json` host permissions

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the LinkMark folder
   - Pin the extension to your toolbar

## 📖 Usage

1. **Login** - Click the LinkMark icon and authenticate with Gmail
2. **Bookmark** - Navigate to any page and click the extension icon
3. **Categorize** - Enter a category name (suggestions will appear)
4. **Save** - Optionally add notes and click "Save Bookmark"
5. **Manage** - Access your bookmarks through your backend dashboard

## 🏗️ Project Structure

```
linkmark/
├── manifest.json           # Extension configuration
├── popup.html             # Extension popup UI
├── popup.css              # Popup styling
├── popup.js               # Main extension logic
├── background.js          # Background service worker
├── icons/                 # Extension icons
├── test.html              # Testing page
├── config.example.js      # Configuration template
├── DEPLOYMENT.md          # Deployment instructions
├── BACKEND.md             # Backend setup options
└── README.md              # This file
```

## 🔧 Configuration

1. **Copy configuration template**
   ```bash
   cp config.example.js config.js
   ```

2. **Update configuration**
   ```javascript
   const CONFIG = {
     GOOGLE_CLIENT_ID: 'your-actual-client-id.apps.googleusercontent.com',
     API_BASE_URL: 'https://your-backend-api.com/api',
     // ... other settings
   };
   ```

3. **Update manifest.json**
   - Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID
   - Update `host_permissions` with your backend URL

## 🧪 Testing

1. **Open test page**
   ```bash
   open test.html
   ```

2. **Run through test scenarios**
   - Authentication flow
   - Bookmark saving
   - Category suggestions
   - Error handling
   - UI responsiveness

3. **Check browser console**
   - Open Developer Tools (F12)
   - Look for any errors or warnings
   - Verify API calls are working

## 🛠️ Development

### Local Development

1. **Make changes** to any file
2. **Reload extension** in Chrome extensions page
3. **Test thoroughly** using test.html
4. **Check console** for errors

### Code Structure

- **`popup.js`** - Main extension logic and UI handling
- **`background.js`** - OAuth authentication and background tasks
- **`popup.html`** - Extension popup structure
- **`popup.css`** - Modern, responsive styling

### Key Components

- **Authentication** - Gmail OAuth with token management
- **Bookmark Management** - CRUD operations with backend API
- **Category System** - Smart suggestions with local storage
- **Error Handling** - Comprehensive error states and recovery
- **UI/UX** - Modern design with loading states and animations

## 📱 Backend Options

Choose from multiple backend architectures:

1. **Node.js + Express + MongoDB** *(Recommended for beginners)*
2. **Python + FastAPI + PostgreSQL** *(For Python developers)*
3. **Serverless (AWS Lambda + DynamoDB)** *(For scale)*
4. **Firebase** *(For rapid prototyping)*
5. **Supabase** *(Open source, full-featured)*

See [BACKEND.md](BACKEND.md) for detailed implementation guides.

## 🚀 Deployment

### Chrome Web Store

1. **Prepare extension** for production
2. **Test thoroughly** across different scenarios
3. **Create store assets** (screenshots, descriptions)
4. **Submit for review** to Chrome Web Store

### Enterprise Distribution

1. **Package as CRX** file
2. **Deploy via Group Policy** or MDM
3. **Configure organization OAuth** settings

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 🔒 Security Features

- **OAuth 2.0** authentication with Google
- **HTTPS only** for all communications
- **Input validation** on all user inputs
- **CORS protection** for API endpoints
- **Token expiration** and refresh handling

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check [DEPLOYMENT.md](DEPLOYMENT.md) and [BACKEND.md](BACKEND.md)
- **Issues**: Report bugs and feature requests
- **Testing**: Use the included `test.html` file for troubleshooting

## 🎯 Roadmap

- [ ] Export/Import bookmarks
- [ ] Advanced search and filtering
- [ ] Chrome sync integration
- [ ] Mobile companion app
- [ ] Team collaboration features

---

Made with ❤️ for better bookmark management
