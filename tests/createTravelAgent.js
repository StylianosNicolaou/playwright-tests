import { login, baseUrl } from "./utils/login.js"; // Import login function
import {
  monitorNetworkRequests,
  monitorConsoleMessages,
  checkForCriticalErrors,
} from "./utils/testUtils.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import minimist from "minimist";

// Get the actual directory of this file
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Parse command-line arguments
const args = minimist(process.argv.slice(2));
const env = args.env || "staging"; // Default to staging
const browserType = args.browser || "webkit"; // Default to Safari

async function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function createTravelAgent() {
  let browser, page;
  const requestErrors = [];
  const consoleMessages = [];

  try {
    // ✅ Pass browserType to the login function
    ({ browser, page } = await login(null, browserType));

    monitorNetworkRequests(page, requestErrors);
    monitorConsoleMessages(page, consoleMessages);

    // Click on "Powerflow"
    await page.waitForSelector('img[alt="Powerflow"]', { state: "visible" });
    await page.click('img[alt="Powerflow"]');
    await delay(20000);

    // Click on "Agents"
    await page.waitForSelector("text=Agents", {
      state: "visible",
    });
    await page.click("text=Agents");
    await delay(20000);

    // Click on button "Add Agent"
    await page.waitForSelector('button[data-testid="add-agent-button"]', {
      state: "visible",
    });
    await page.click('button[data-testid="add-agent-button"]');
    await delay(20000);

    // Click on Model button
    await page.waitForSelector(
      'button[data-testid="model-select-dropdown-trigger"]',
      {
        state: "visible",
      }
    );
    await page.click('button[data-testid="model-select-dropdown-trigger"]');
    await delay(20000);

    // Click on "All Models" button
    await page.waitForSelector(
      'button[data-testid="model-select-dropdown-back-to-groups"]',
      {
        state: "visible",
      }
    );
    await page.click(
      'button[data-testid="model-select-dropdown-back-to-groups"]'
    );
    await delay(20000);

    // Click on "OpenAI Models" button
    await page.waitForSelector('button:has-text("OpenAI Models")', {
      state: "visible",
    });
    await page.click('button:has-text("OpenAI Models")');
    await delay(20000);

    // Clcik "GPT-40 mini" button
    await page.waitForSelector('button:has-text("GPT-4o Mini")', {
      state: "visible",
    });
    await page.click('button:has-text("GPT-4o Mini")');
    await delay(2000);

    // Find the input field and type "Travel Agent"
    await page.waitForSelector('input[data-testid="agent-name-input"]', {
      state: "visible",
    });
    await page.fill('input[data-testid="agent-name-input"]', "Travel Agent");
    await delay(20000);
    console.log("✅ Agent name added successfully");

    // Click on the message input
    await page.waitForSelector("div.editor-placeholder", { state: "visible" });
    await page.click("div.editor-placeholder");

    // Type the first message
    await page.keyboard.type(
      "Suggest 10 honeymoon destinations during summer season",
      { delay: 1000 }
    );
    await delay(20000);
    console.log("✅ First message added successfully");

    // Click the "Add Message" button
    await page.waitForSelector('button[data-testid="add-message-button"]', {
      state: "visible",
    });
    await page.click('button[data-testid="add-message-button"]');
    await delay(20000);
    console.log("✅ Add Message button clicked successfully");

    // Type the second message
    await page.keyboard.type(
      "For each of the above honeymoon destinations, suggest the two ideal hotels for honeymooners",
      { delay: 1000 }
    );
    await delay(20000);
    console.log("✅ Second message added successfully");

    // Click the "Add Message" button
    await page.waitForSelector('button[data-testid="add-message-button"]', {
      state: "visible",
    });
    await page.click('button[data-testid="add-message-button"]');
    await delay(20000);
    console.log("✅ Add Message button clicked successfully");

    // Type the third message
    await page.keyboard.type(
      "Now also output 3 activities for each destination",
      { delay: 1000 }
    );
    await delay(20000);
    console.log("✅ Second message added successfully");

    // Click the "Create Agent" button
    await page.waitForSelector('button[data-testid="create-agent-button"]', {
      state: "visible",
    });
    await page.click('button[data-testid="create-agent-button"]');
    await delay(20000);
    console.log("✅ Create agent button clicked successfully");

    // Click the "Run" button (button containing the `LuPlay` SVG icon)
    await page.waitForSelector(
      'button:has(svg[data-sentry-element="LuPlay"])',
      { state: "visible" }
    );
    await page.click('button:has(svg[data-sentry-element="LuPlay"])');
    await delay(20000);

    // Click white "Run" button
    await page.waitForSelector('button.bg-slate-900:has-text("Run")', {
      state: "visible",
    });
    await page.click('button.bg-slate-900:has-text("Run")');
    console.log("✅ White 'Run' button clicked");
    await delay(20000);

    // Wait for the result card to appear
    await page.waitForSelector('h2[data-sentry-element="CardTitle"]', {
      state: "visible",
    });

    // Get the text content of the H2 element
    const resultTitle = await page.textContent(
      'h2[data-sentry-element="CardTitle"]'
    );

    // Wait for the paragraph element inside the Result Card Footer
    await page.waitForSelector("p.text-slate-500", { state: "visible" });

    // Get the text content of the paragraph
    const resultText = await page.textContent("p.text-slate-500");

    if (
      resultTitle.trim() === "Travel Agent" &&
      resultText.trim() === "Created less than a minute ago"
    ) {
      console.log(
        "✅ The result card contains 'Travel Agent' and the 'Created less than a minute ago' text."
      );
    } else {
      if (resultTitle.trim() !== "Travel Agent") {
        console.error(
          `❌ Expected 'Travel Agent', but found: '${resultTitle}'`
        );
      }
      if (resultText.trim() !== "Created less than a minute ago") {
        console.error(
          `❌ Expected 'Created less than a minute ago', but found: '${resultText}'`
        );
      }
      throw new Error(
        "❌ Test failed: Result card or footer text is incorrect."
      );
    }

    checkForCriticalErrors(requestErrors, consoleMessages);

    // Catch the error if test failed or close the browser
  } catch (error) {
    console.error(`❌ Test failed in ${browserType}:`, error);
    process.exit(1); // Ensures test runner detects failure
  } finally {
    // Close browser
    await delay(20000);
    if (browser) await browser.close();
  }
}

// Run the test
createTravelAgent();
