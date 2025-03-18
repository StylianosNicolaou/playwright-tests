import { login, page, baseUrl } from "./utils/login.js";
import { tenantSwitcher } from "./utils/tenantSwitcher.js";
import minimist from "minimist";

// Process the arguments given in terminal
const args = minimist(process.argv.slice(2));
const browserType = args.browser || "chromium"; // Default to Chrome

// Delay function
async function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function verifyConversation() {
  let browser, page;

  try {
    // Log in to the app
    ({ browser, page } = await login(null, browserType));

    await delay(10000);
    // Switch to "System" tenant
    await tenantSwitcher();
    await delay(5000);

    // Verify the tenant switch was successful
    const selectedTenantButton = await page.$('button[aria-label="Selected"]');
    if (!selectedTenantButton) {
      throw new Error("❌ System tenant is not selected");
    }
    console.log("✅ Verified that 'Developer' tenant is selected");

    // Go to "Conversations" tab
    await page.goto(`${baseUrl}powerflow/my-results`, {
      waitUntil: "networkidle",
    });

    // Find the latest "Travel Agent" row
    const travelAgentRow = await page
      .locator('tr:has-text("Travel Agent")')
      .first();

    // Extract Title, Status, and Created At date
    const title = await travelAgentRow
      .locator("td:nth-child(2) span")
      .textContent();
    const status = await travelAgentRow
      .locator("td:nth-child(4) span")
      .textContent();
    const createdAt = await travelAgentRow
      .locator("td:nth-child(6)")
      .textContent();

    // Verify "STATUS" is "Done"
    if (status.trim() !== "Done") {
      console.error(`❌ Agent "${title}" is not done. Status: ${status}`);
      return;
    }

    // Print "CREATED AT" timestamp
    console.log(`✅ Latest Agent: ${title}`);
    console.log(`📅 Created At: ${createdAt.trim()}`);

    // Click the "Replies Only" button
    await page.waitForSelector('button[data-testid="replies-only-switch"]', {
      state: "visible",
    });
    await page.click('button[data-testid="replies-only-switch"]');
    await delay(3000);

    // Click the agent title
    await travelAgentRow.locator("td:nth-child(2) span").click();
    console.log(`✅ Clicked on agent: ${title}`);
  } catch (error) {
    console.error("❌ Test Failed", error);
  } finally {
    await delay(10000);
    if (browser) await browser.close();
  }
}

verifyConversation();
