# LinkedIn Profile Scraper

This is a Chrome extension that automates the extraction of key profile data from LinkedIn. It currently collects Country Code (CC), Region, and Company information for each LinkedIn profile, allowing you to control navigation through profiles with an intuitive interface.

![image](https://github.com/user-attachments/assets/8126a8b5-e242-439b-b7a6-1714d68e6462) 

---

## Features

- ✅ Automated scraping of LinkedIn profiles
- ✅ Extracts **Country Code**, **Region**, **Company**, and **Job Progression** but can be adapted for anything
- ✅ Start, pause, and navigate through profiles with an intuitive UI
- ✅ Imports URL lists via manual input or CSV upload
- ✅ Live output display with persistent storage (even across restarts) (using Chrome Local Storage)
- ✅ Download and copy results instantly
- ✅ Handles broken/404 LinkedIn profiles gracefully

---

## How It Works

1. Click the Extension to open the popup and click the settings icon.
2. Load a list of LinkedIn profile URLs (CSV import supported).
3. Start the scraper using the popup UI.
4. The extension visits each profile, scrapes data, and stores results.
5. Output is displayed live and saved to `chrome.storage.local` for persistence.
6. You can pause, resume, or navigate through entries anytime.

![image](https://github.com/user-attachments/assets/3bcb1ce4-588d-46e0-b680-c04608be1de2)

---

## Installation

1. Clone or download this repository.
2. Go to `chrome://extensions/` in Chrome.
3. Enable **Developer Mode** (top right).
4. Click **Load Unpacked** and select the extension folder.
5. Done! You should now see the extension icon in Chrome.

---

## Usage

### Settings Page
- **Import CSV**: Upload a CSV with `LinkedIn Url` column. Only entries with blank CC, Region, and Company fields are imported.
- **Manual Input**: Paste profile URL paths (e.g., `/in/username/`) directly.
- **Live Output Area**: See your scraped results update in real-time.
- **Export Options**: Copy or download your results as a text file.

### Popup Controls
- **Start/Pause Button**: Toggle scraper on/off.
- **Back/Next Buttons**: Navigate through previously scraped or new profiles.
- **Live Data View**: See CC, Region, Company, and Job Progression for each profile.

---

## Tech Stack
- HTML / CSS / JavaScript
- Chrome Extension APIs
- XPath Selectors for LinkedIn DOM scraping
- Persistent storage with `chrome.storage.local`

---

## ⚠️ Disclaimer
This tool is intended for **educational and personal use only**. Use responsibly and in accordance with LinkedIn's terms of service.

---

