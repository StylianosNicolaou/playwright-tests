export function monitorNetworkRequests(page, requestErrors) {
  page.on("requestfailed", (request) => {
    requestErrors.push({
      url: request.url(),
      method: request.method(),
      error: request.failure()?.errorText || "Unknown error",
    });
  });
}

export function logRequestErrors(requestErrors) {
  if (requestErrors.length > 0) {
    console.error("❌ Network request errors detected:");
    requestErrors.forEach((error) => {
      console.error(`🔴 ${error.method} ${error.url} - ${error.error}`);
    });
  } else {
    console.log("✅ No network request errors detected.");
  }
}

export async function checkForErrorsOnPage(page) {
  const errors = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".error, .alert-danger")).map(
      (errorElement) => errorElement.innerText.trim()
    );
  });

  if (errors.length > 0) {
    console.error("❌ UI Errors detected on the page:", errors);
  } else {
    console.log("✅ No UI errors detected.");
  }
}

export function monitorConsoleMessages(page, consoleMessages) {
  page.on("console", (msg) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
    });
  });
}

export function logConsoleMessages(consoleMessages) {
  if (consoleMessages.length > 0) {
    console.log("🟡 Console Messages Detected:");
    consoleMessages.forEach((msg) => {
      console.log(`[${msg.type.toUpperCase()}] ${msg.text}`);
    });
  } else {
    console.log("✅ No console messages detected.");
  }
}
