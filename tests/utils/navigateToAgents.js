import { page, baseUrl } from "./login.js"; // Use shared `page` object

// ✅ Function to navigate to the Agents page
export async function navigateToAgents() {
  try {
    console.log("✅ Navigating to Agents main page...");

    const targetUrl = `${baseUrl}powerflow/agents/`;
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 15000 });

    const currentUrl = page.url();
    console.log(`🔍 Current URL after navigation: ${currentUrl}`);

    if (!currentUrl.includes("powerflow/agents")) {
      console.error(
        `❌ Navigation failed: Expected URL to include 'powerflow/agents', but got ${currentUrl}`
      );
      throw new Error(`Navigation to Agents page failed: ${currentUrl}`);
    }

    console.log("✅ Successfully navigated to the Agents page.");
  } catch (error) {
    console.error("❌ Error while accessing Agents main page:", error);
    throw error;
  }
}
