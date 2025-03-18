export function monitorNetworkRequests(page, requestErrors) {
  page.on("requestfailed", (request) => {
    const status = request.failure()?.errorText || "Unknown Error";
    const url = request.url();

    if (status.includes("500")) {
      console.error(`❌ Internal Server Error (500) on ${url}`);
      requestErrors.push({ url, status: "500 Internal Server Error" });
    } else if (status.includes("404")) {
      console.error(`❌ Not Found Error (404) on ${url}`);
      requestErrors.push({ url, status: "404 Not Found" });
    } else if (status.includes("401") || status.includes("403")) {
      console.error(`❌ Possible Session Expired on ${url}`);
      requestErrors.push({ url, status: "401/403 Unauthorized" });
    } else {
      console.error(`❌ Request Failed: ${status} on ${url}`);
      requestErrors.push({ url, status });
    }
  });

  page.on("response", async (response) => {
    const status = response.status();
    const url = response.url();

    if (status === 500) {
      console.error(`❌ Internal Server Error (500) on ${url}`);
      requestErrors.push({ url, status: "500 Internal Server Error" });
    } else if (status === 404) {
      console.error(`❌ Not Found Error (404) on ${url}`);
      requestErrors.push({ url, status: "404 Not Found" });
    } else if (status === 401 || status === 403) {
      console.error(`❌ Possible Session Expired on ${url}`);
      requestErrors.push({ url, status: "401/403 Unauthorized" });
    }
  });
}

export function monitorConsoleMessages(page, consoleMessages) {
  page.on("console", (message) => {
    const text = message.text().toLowerCase();

    if (text.includes("session not found")) {
      console.error("❌ Session Not Found Error detected in console.");
      consoleMessages.push("Session Not Found");
    } else if (
      text.includes("unauthorized") ||
      text.includes("authentication failed")
    ) {
      console.error("❌ Authentication Issue detected in console.");
      consoleMessages.push("Authentication Issue");
    }

    consoleMessages.push(text);
  });
}

// ✅ Check if any critical errors exist and fail the test if found
export function checkForCriticalErrors(requestErrors, consoleMessages) {
  const criticalErrors = [
    ...requestErrors.map((e) => e.status),
    ...consoleMessages,
  ];

  if (
    criticalErrors.some((error) =>
      [
        "500 Internal Server Error",
        "404 Not Found",
        "401/403 Unauthorized",
        "Session Not Found",
      ].includes(error)
    )
  ) {
    throw new Error(`❌ Critical error detected: ${criticalErrors.join(", ")}`);
  }
}
