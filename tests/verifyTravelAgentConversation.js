import { login, page, baseUrl } from "./utils/login.js";
import {
  monitorNetworkRequests,
  monitorConsoleMessages,
  checkForCriticalErrors,
} from "./utils/testUtils.js";
import { tenantSwitcher } from "./utils/tenantSwitcher.js";
import minimist from "minimist";
import { navigateToAgents } from "./utils/navigateToAgents.js";
// Process the arguments given in terminal
const args = minimist(process.argv.slice(2));
const browserType = args.browser; // Default to Chrome

// Delay function
async function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
async function verifyTravelConversation() {
  let browser, page;
  const requestErrors = [];
  const consoleMessages = [];
  try {
    // Log in to the app
    console.log("🔄 Logging in and switching tenant...");
    ({ browser, page } = await login(null, browserType));

    await delay(20000);

    console.log("🔄 Switching to 'Administrator' tenant...");
    await tenantSwitcher(); // Ensure correct tenant is selected before proceeding

    await delay(20000);

    // Navigate to Agents page after ensuring tenant is switched
    console.log("🔄 Navigating to Agents page...");
    await navigateToAgents();

    // Go to "Conversations" tab
    await page.waitForSelector('img[alt="SidebarConversationIcon"]', {
      state: "visible",
    });
    await page.click('img[alt="SidebarConversationIcon"]');
    await delay(20000);

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

    // Click the agent title
    await travelAgentRow.locator("td:nth-child(2) span").click();
    console.log(`✅ Clicked on agent: ${title}`);
    await delay(20000);

    // Click the "Replies Only" button
    await page.waitForSelector('button[id="replies-only-switch"]', {
      state: "visible",
    });
    await page.click('button[id="replies-only-switch"]');
    await delay(20000);
    console.log(`✅ Clicked on 'Replies Only' button`);

    // ✅ Locate the results section
    await page.waitForSelector('[data-testid="virtuoso-item-list"]', {
      timeout: 20000,
    });
    console.log("✅ Results section found.");
    await delay(20000);

    await page.evaluate(() => {
      document
        .querySelector('[data-testid="virtuoso-scroller"]')
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    console.log("🔄 Scrolling to the top to load earlier messages...");
    await delay(20000);

    // ✅ Find the first message (data-index="0")
    await page.waitForSelector('[data-index="0"]', { timeout: 20000 });
    console.log("✅ First message found.");

    // ✅ Check for message bubble
    const messageBubbleSelector =
      '[data-index="0"] [data-sentry-component="MessageBubble"]';
    const messageBubble = await page.$(messageBubbleSelector);

    if (!messageBubble) {
      throw new Error("❌ No message bubble found.");
    }
    console.log("✅ Message bubble found.");
    await delay(20000);

    // ✅ Verify message text
    const expectedText =
      "Suggest 10 honeymoon destinations during summer season";
    await page.waitForSelector(
      '[data-index="0"] [data-sentry-component="MarkdownMessage"] p',
      { timeout: 20000 }
    );
    const messageText = await page.$eval(
      '[data-index="0"] [data-sentry-component="MarkdownMessage"] p',
      (el) => el.textContent.trim()
    );

    if (messageText !== expectedText) {
      throw new Error(
        `❌ Message text does not match. Expected: '${expectedText}', Found: '${messageText}'`
      );
    }

    console.log("✅ Message text verified successfully.");

    checkForCriticalErrors(requestErrors, consoleMessages);
  } catch (error) {
    console.error("❌ Test Failed", error);
    process.exit(1); // Ensures test runner detects failure
  } finally {
    await delay(20000);
    if (browser) await browser.close();
  }
}

verifyTravelConversation();
