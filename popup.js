let urlList = [];
let currentIndex = 0;
let scrapedData = []; // { profileURL, cc, region, company, jobProgression }
let isRunning = false;

// DOM Elements
const entryDisplay = document.getElementById("entryDisplay");
const entryPath = document.getElementById("entryPath");
const settingsBtn = document.getElementById("settingsBtn");
const statusText = document.getElementById("statusText");
const startStopBtn = document.getElementById("startStopBtn");
const startStopIcon = document.getElementById("startStopIcon");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const ccField = document.getElementById("ccField");
const regionField = document.getElementById("regionField");
const companyField = document.getElementById("companyField");
const jobProgMsg = document.getElementById("jobProgressionMessage");

// Load state from chrome.storage.local
function loadState(callback) {
  chrome.storage.local.get(
    ["urlList", "currentIndex", "scrapedData", "isRunning"],
    function (result) {
      if (result.urlList) {
        urlList = result.urlList;
      }
      if (typeof result.currentIndex === "number") {
        currentIndex = result.currentIndex;
      }
      if (result.scrapedData) {
        scrapedData = result.scrapedData;
      }
      if (typeof result.isRunning === "boolean") {
        isRunning = result.isRunning;
      }
      callback();
    }
  );
}

function updateEntryDisplay() {
  entryDisplay.textContent = `Entry ${currentIndex + 1} of ${urlList.length}`;
  entryPath.textContent = urlList[currentIndex] || "";
  if (currentIndex >= scrapedData.length) {
    // Not scraped yet, add a visual indicator on the next arrow
    nextBtn.classList.add("new-record");
    nextBtn.title = "Next (will scrape new record)";
  } else {
    nextBtn.classList.remove("new-record");
    nextBtn.title = "Next";
  }
  saveState();
}

function displayData(record) {
  ccField.textContent = record.cc || "";
  regionField.textContent = record.region || "";
  companyField.textContent = record.company || "";
  if (record.jobProgression) {
    jobProgMsg.textContent = "Job Progression Record";
  } else {
    jobProgMsg.textContent = "";
  }
  statusText.textContent = "Status: Scraped";
}

function clearDisplay() {
  ccField.textContent = "";
  regionField.textContent = "";
  companyField.textContent = "";
  jobProgMsg.textContent = "";
  statusText.textContent = "Status: Idle";
}

function saveState() {
  chrome.storage.local.set(
    {
      urlList: urlList,
      currentIndex: currentIndex,
      scrapedData: scrapedData,
      isRunning: isRunning,
    },
    function () {
      console.log("State saved to chrome storage.");
    }
  );
}

function navigateToCurrent() {
  updateEntryDisplay();
  if (currentIndex < scrapedData.length) {
    // Already scraped, display it
    displayData(scrapedData[currentIndex]);
  } else {
    // Not yet scraped, clear display and trigger navigation
    clearDisplay();
    statusText.textContent = "Status: Scraping...";
    let path = urlList[currentIndex];
    let fullURL = path.startsWith("http")
      ? path
      : "https://www.linkedin.com" + path;
    chrome.storage.local.set({ currentProfileURL: fullURL }, () => {
      console.log("Saved currentProfileURL:", fullURL);

      // Now navigate to the URL
      chrome.tabs.update({ url: fullURL }, function () {
        // The content script will handle scraping and send data back
      });
    });
  }
}

// Button Listeners
startStopBtn.addEventListener("click", function () {
  isRunning = !isRunning;
  if (isRunning) {
    startStopIcon.textContent = "⏸️";
    statusText.textContent = "Status: Running";
    // Load URL list from storage (options page should have saved it)
    chrome.storage.local.get(["urlList"], function (result) {
      if (result.urlList && result.urlList.length > 0) {
        urlList = result.urlList;
        currentIndex = 0;
        scrapedData = scrapedData || [];
        navigateToCurrent();
      } else {
        alert(
          "No URL list found. Please go to Settings to enter LinkedIn URL paths."
        );
        isRunning = false;
        startStopIcon.textContent = "▶️";
        statusText.textContent = "Status: Idle";
      }
      saveState();
    });
  } else {
    startStopIcon.textContent = "▶️";
    statusText.textContent = "Status: Paused";
    saveState();
  }
});

backBtn.addEventListener("click", function () {
  if (currentIndex > 0) {
    currentIndex--;
    navigateToCurrent();
  }
  saveState();
});

nextBtn.addEventListener("click", function () {
  if (currentIndex < urlList.length - 1) {
    currentIndex++;
    navigateToCurrent();
  } else {
    alert("You are at the end of the list.");
  }
  saveState();
});

// Open options page from settings button
settingsBtn.addEventListener("click", function () {
  chrome.runtime.openOptionsPage();
});

// On popup load, restore state
document.addEventListener("DOMContentLoaded", function () {
  loadState(function () {
    updateEntryDisplay();
    if (currentIndex < scrapedData.length) {
      displayData(scrapedData[currentIndex]);
    } else {
      clearDisplay(); // If not yet scraped
    }
    // If running, update status
    if (isRunning) {
        startStopIcon.textContent = "⏸️";
      statusText.textContent = "Status: Running";
    } else {
      startStopIcon.textContent = "▶️";
      statusText.textContent = "Status: Idle";
    }
  });
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "updateOutput") {
    if (!message.data) {
      console.warn("Empty message received", message);
      return;
    }

    let parts = message.data.split(" | ");
    if (parts.length < 4) {
      console.warn("Malformed message.data", message.data);
      return;
    }
    // Parse the output (format: "profileURL | CC: ... | Region: ... | Company: ...")
    let record = {
      profileURL: parts[0],
      cc: parts[1].replace("CC: ", "").trim(),
      region: parts[2].replace("Region: ", "").trim(),
      company: parts[3].replace("Company: ", "").trim(),
      jobProgression: message.jobProgression || false,
    };
    scrapedData[currentIndex] = record;
    displayData(record);
    saveState();
    // Clean up currentProfileURL AFTER processing
    chrome.storage.local.remove("currentProfileURL", () => {
      console.log(
        "Removed currentProfileURL after processing",
        record.profileURL
      );
    });
  }
});
