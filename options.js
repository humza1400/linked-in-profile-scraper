function renderScrapedData() {
  chrome.storage.local.get(["scrapedData"], function (result) {
    const scraped = result.scrapedData || [];
    const outputLines = scraped.map(
      (record) =>
        `${record.profileURL} | CC: ${record.cc} | Region: ${record.region} | Company: ${record.company}`
    );
    const outputArea = document.getElementById("outputArea");
    outputArea.value = outputLines.join("\n");

    // Update count
    document.getElementById(
      "outputHeader"
    ).textContent = `Output (${scraped.length})`;
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Load saved URL list from storage
  chrome.storage.local.get(["urlList"], function (result) {
    if (result.urlList) {
      document.getElementById("urlInput").value = result.urlList.join("\n");
    }
  });

  // Save URL list when user clicks Save
  document.getElementById("saveBtn").addEventListener("click", function () {
    let urls = document
      .getElementById("urlInput")
      .value.split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    chrome.storage.local.set({ urlList: urls }, function () {
      alert("URL list saved.");
    });
  });

  // Copy Output button
  document.getElementById("copyBtn").addEventListener("click", function () {
    let outputArea = document.getElementById("outputArea");
    outputArea.select();
    document.execCommand("copy"); // TODO: Use Clipboard API
    alert("Output copied to clipboard.");
  });

  // Download Output button
  document.getElementById("downloadBtn").addEventListener("click", function () {
    let outputText = document.getElementById("outputArea").value;
    let blob = new Blob([outputText], { type: "text/plain" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "linkedin_output.txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import CSV functionality
  document.getElementById("importBtn").addEventListener("click", function () {
    let fileInput = document.getElementById("csvImport");
    if (fileInput.files.length === 0) {
      alert("Please select a CSV file first.");
      return;
    }
    let file = fileInput.files[0];
    let reader = new FileReader();
    reader.onload = function (e) {
      let text = e.target.result;
      //  CSV parsing, assuming comma-separated with header row
      let lines = text.split("\n").filter((line) => line.trim() !== "");
      if (lines.length === 0) {
        alert("CSV file is empty.");
        return;
      }
      let header = lines[0].split(",").map((s) => s.trim().toLowerCase());
      let urlColIndex = header.indexOf("linkedin url");
      let companyColIndex = header.indexOf("company");
      let ccColIndex = header.indexOf("cc");
      let regionColIndex = header.indexOf("region");
      if (urlColIndex === -1) {
        alert("CSV does not contain a 'LinkedIn Url' column.");
        return;
      }
      let totalCSVRecords = lines.length - 1;
      let matchedURLs = [];
      for (let i = 1; i < lines.length; i++) {
        let cols = lines[i].split(",").map((s) => s.trim());
        let url = cols[urlColIndex];
        // Check if Company, CC, and Region are blank (or missing)
        let companyVal = companyColIndex !== -1 ? cols[companyColIndex] : "";
        let ccVal = ccColIndex !== -1 ? cols[ccColIndex] : "";
        let regionVal = regionColIndex !== -1 ? cols[regionColIndex] : "";
        if (url && !companyVal && !ccVal && !regionVal) {
          matchedURLs.push(url);
        }
      }
      document.getElementById("urlInput").value = matchedURLs.join("\n");
      chrome.storage.local.set({ urlList: matchedURLs }, function () {
        alert(
          `Imported ${totalCSVRecords} records; found ${matchedURLs.length} valid LinkedIn URLs.`
        );
      });
      // Update output header to show count of valid URLs
      document.getElementById(
        "outputHeader"
      ).textContent = `Output (${matchedURLs.length})`;
      // Also update an info text below the import section
      document.getElementById(
        "importInfo"
      ).textContent = `CSV Records: ${totalCSVRecords} | Valid URLs: ${matchedURLs.length}`;
    };
    reader.readAsText(file);
  });

  renderScrapedData();

  chrome.storage.onChanged.addListener(function (changes, area) {
    if (area === "local" && changes.scrapedData) {
      renderScrapedData();
    }
  });
});
