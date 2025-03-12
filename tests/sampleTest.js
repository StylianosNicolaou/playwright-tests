import { chromium } from "@playwright/test";

async function runSampleTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("🔍 Navigating to Google...");
    await page.goto("https://www.google.com", { waitUntil: "networkidle" });

    // ✅ Check if page title is "Google"
    const title = await page.title();
    if (title === "Google") {
      console.log("✅ Test Passed: Google loaded successfully.");
    } else {
      throw new Error(
        `❌ Test Failed: Expected title 'Google', but got '${title}'`
      );
    }
  } catch (error) {
    console.error(error);
    process.exit(1); // Exit with error code 1 to fail GitHub Actions
  } finally {
    await browser.close();
  }
}

runSampleTest();
