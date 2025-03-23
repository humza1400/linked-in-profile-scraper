chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.action === "extractionResult") {
      // Save scraped data in storage immediately (important for 404 cases)
      chrome.storage.local.get(["scrapedData"], (result) => {
        let scraped = result.scrapedData || [];
        
        // Parse message.data to make sure it's consistent
        let parts = message.data.split(" | ");
        let record = {
          profileURL: parts[0] || sender.url || "", // Fallback if missing
          cc: parts[1]?.replace("CC: ", "").trim() || "",
          region: parts[2]?.replace("Region: ", "").trim() || "",
          company: parts[3]?.replace("Company: ", "").trim() || "",
          jobProgression: message.jobProgression || false
        };
        
        scraped.push(record);
        
        chrome.storage.local.set({ scrapedData: scraped }, () => {
          console.log("Saved to scrapedData:", record);
        });
      });
  
      // Send update to options or popup
      chrome.runtime.sendMessage({
        action: "updateOutput",
        data: message.data,
        jobProgression: message.jobProgression
      });
    }
  });
  