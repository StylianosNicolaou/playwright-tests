import { chromium, firefox, webkit } from "@playwright/test"; // Import all browsers
import minimist from "minimist";

// Parse command-line arguments
const args = minimist(process.argv.slice(2));
const baseUrl =
  args.env === "staging"
    ? "https://stg.accelerate.unic.ac.cy/en/"
    : "https://accelerate.unic.ac.cy/en/";
const browserType = args.browser || "webkit"; // Default to Safari (WebKit)

let browser;
let page;

async function login(passedPage) {
  if (!browser && !passedPage) {
    // ✅ Launch the selected browser (default: Safari)
    browser = await getBrowserInstance(browserType);
    page = await browser.newPage();
  } else if (passedPage) {
    page = passedPage; // Use the passed page
  }

  // ✅ Perform login in the selected browser
  await page.goto(`${baseUrl}signin`, { waitUntil: "networkidle" });
  await page.waitForSelector('input[type="email"]', { state: "visible" });
  await page.fill('input[type="email"]', "polykarpou.f@yahoo.com"); // Replace with actual username
  await page.waitForSelector('input[type="password"]', { state: "visible" });
  await page.fill('input[type="password"]', "fUnic1995/"); // Replace with actual password
  await page.keyboard.press("Enter");
  await page.waitForLoadState("networkidle");

  console.log(`✅ Login successful on ${browserType}`);
  return { browser, page }; // Return browser and page for further use
}

// ✅ Function to get the correct browser instance
async function getBrowserInstance(browserType) {
  switch (browserType) {
    case "chromium":
      return await chromium.launch({ headless: true });
    case "firefox":
      return await firefox.launch({ headless: true });
    case "webkit":
      return await webkit.launch({ headless: true }); // Default: Safari
    default:
      throw new Error(`❌ Unknown browser type: ${browserType}`);
  }
}

export { login, page, browser, baseUrl };
