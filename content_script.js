(function () {
  // Wait for the page to load
  setTimeout(function () {
    chrome.storage.local.get("currentProfileURL", (data) => {
      const profileURL = data.currentProfileURL || window.location.href;

      // 404 Redirect Handling
      if (
        window.location.pathname === "/404" ||
        window.location.pathname === "/404/"
      ) {
        console.log("404 page detected, sending empty values for:", profileURL);
        chrome.runtime.sendMessage({
          action: "extractionResult",
          data: `${profileURL} | CC:  | Region:  | Company: `,
          jobProgression: false,
        });
        return;
      }

      // --- XPATH Configurations ---
      var XPATH_HEADER_LOCATION =
        "//*[@id='profile-content']/div/div[2]/div/div/main/section[1]/div[2]/div[2]/div[2]/span[1]";
      var XPATH_PRIMARY_COMPANY =
        "//section[.//span[text()='Experience']]//ul/li[1]//a/span/span[1]";
      var XPATH_ROLE_PROGRESSION =
        "//section[.//span[text()='Experience']]//ul/li[1]//a//div[contains(@class, 'mr1')]//span[@aria-hidden='true']";

      // Evaluate XPath
      function getElementByXPath(xpath) {
        return document.evaluate(
          xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
      }

      //Extract Location
      var cc = "",
        region = "";
      try {
        var locElem = getElementByXPath(XPATH_HEADER_LOCATION);
        if (locElem && locElem.textContent) {
          var locationText = locElem.textContent.trim();
          var parts = locationText.split(",").map(function (s) {
            return s.trim();
          });
          if (parts.length === 1) {
            region = parts[0];
          } else if (parts.length === 2) {
            region = parts[0];
            cc = parts[1];
          } else if (parts.length >= 3) {
            cc = parts[parts.length - 1];
            region = parts.slice(0, parts.length - 1).join(", ");
          }
        }
      } catch (e) {
        console.log("Error extracting location: " + e);
      }

      // Extract Company Info
      var company = "";
      var jobProgression = false;
      try {
        var firstExp = document.evaluate(
          "//section[.//span[text()='Experience']]//ul/li[1]",
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        if (firstExp) {
          var timelineIndicator = firstExp.querySelector(
            "span.scJryXGkCZYyFwrHBvaFeXBkiWVCosGjOEM"
          );
          if (timelineIndicator) {
            jobProgression = true;
            console.log("Job progression detected.");
          }
        }
        var xpathToUse = jobProgression
          ? XPATH_ROLE_PROGRESSION
          : XPATH_PRIMARY_COMPANY;
        var companyElem = getElementByXPath(xpathToUse);
        if (companyElem && companyElem.textContent) {
          var company_raw = companyElem.textContent.trim();
          company = company_raw.split("·")[0].trim();
        }
      } catch (e) {
        console.log("Error extracting company info: " + e);
      }

      // Format and Output the Result
      var outputLine =
        profileURL +
        " | CC: " +
        cc +
        " | Region: " +
        region +
        " | Company: " +
        company;
      console.log(outputLine);

      // Send message to background (and then popup/options)
      chrome.runtime.sendMessage({
        action: "extractionResult",
        data: outputLine,
        jobProgression: jobProgression,
      });
    });
  }, 3000); // 3 sec delay to let site load
})();
