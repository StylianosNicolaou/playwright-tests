//Create an Agent (Foodie Agent) on Powerflow

import { login } from "./login.js";
import minimist from "minimist";

// Process the arguments given in terminal
const args = minimist(process.argv.slice(2));
const browserType = args.browser || "chromium"; // Default to Chrome

// Delay time so that the page can load
async function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}


async function createFoodieAgent() {
  let browser, page;

  try {
    // Log in to the app
    ({ browser, page } = await login(null, browserType));

    // Wait for and click the "My Apps" section
    await page.waitForSelector('img[alt="My Apps"]', { state: "visible" });
    await page.click('img[alt="My Apps"]');
    console.log("✅ My Apps clicked successfully");
    await delay(3000);

    // Click "Powerflow"
    await page.waitForSelector('img[alt="Powerflow"]', { state: "visible" });
    await page.click('img[alt="Powerflow"]');
    console.log("✅ Powerflow clicked successfully");
    await delay(3000);

    // Click "Agents"
    await page.waitForSelector('img[alt="SidebarAgentsIcon"]', { state: "visible" });
    await page.click('img[alt="SidebarAgentsIcon"]');
    console.log("✅ Agents clicked successfully");
    await delay(3000);

    // Wait for and click the "Add Agent" button
    await page.waitForSelector('button[data-testid="add-agent-button"]', { state: 'visible' });
    await page.click('button[data-testid="add-agent-button"]'); // Click the button
    await delay(3000);
    console.log("✅ Add agent button clicked successfully");

    //Write Agent Name
    const inputField = page.locator('[data-testid="agent-name-input"]');
    await inputField.fill('Foodie Agent');
    await delay(3000);
    console.log("✅ Agent Name added successfully");

    //Adding First Message
    await page.waitForSelector('div.editor-placeholder', {state: 'visible'});
    await page.click('div.editor-placeholder');
    await page.keyboard.type("Suggest 5 <<var:cuisine>> restaurants during summer season in Protaras", {delay: 100});
    await delay(3000);
    console.log("✅ First Message added successfully");


    // Wait for and click the "Add Message" button
    await page.waitForSelector('button[data-testid="add-message-button"]', { state: 'visible' });
    await page.click('button[data-testid="add-message-button"]'); // Click the button
    await delay(3000);
    console.log("✅ Add Message button clicked successfully");

    //Adding Second Message
    await page.waitForSelector('div.editor-placeholder', {state: 'visible'});
    await page.click('div.editor-placeholder');
    await page.keyboard.type("For each of the above restaurant, suggest appetizers, main courses and deserts", {delay: 100});
    await delay(3000);
    console.log("✅ Second Message added successfully");

    // Wait for and click the "Create Agent" button
    await page.waitForSelector('button[data-testid="create-agent-button"]', { state: 'visible' });
    await page.click('button[data-testid="create-agent-button"]'); // Click the button
    await delay(3000);
    console.log("✅ Create agent button clicked successfully");

    //Click the Run Button (SVG)
    await page.waitForSelector('svg[data-sentry-element="LuPlay"]', { state: "visible" });
    await page.click('svg[data-sentry-element="LuPlay"]');
    console.log("✅ Run button clicked successfully");
    await delay(3000);

    //Giving value to variable
    await page.waitForSelector('textarea[placeholder="Enter value for cuisine"]', {state: "visible"});
    await page.click('textarea[placeholder="Enter value for cuisine"]');
    await page.keyboard.type("Italian", {delay: 100});
    await delay(3000);
    console.log("✅ Variable <Italian> added successfully");

    //Click the white Run Button (SVG)
    await page.waitForSelector('button.bg-slate-900:has-text("Run")', { state: "visible" });
    await page.click('button.bg-slate-900:has-text("Run")');
    console.log("✅ White Run button clicked successfully");
    await delay(3000);

    //Verification of Test
    //Wait for the result card to appear
    await page.waitForSelector('h2[data-sentry-element="CardTitle"]', {state: "visible"});
  
    //Get the text content of the H2 element
    const resultTitle = await page.textContent('h2[data-sentry-element="CardTitle"]');
  
    // Wait for the paragraph element inside the Result Card Footer
    await page.waitForSelector("p.text-slate-500", { state: "visible" });
  
    //Get the text content of the paragraph
    const resultText = await page.textContent("p.text-slate-500");
  
    if (resultTitle.trim() === "Foodie Agent" && resultText.trim() === "Created less than a minute ago") 
    {
        console.log("✅ The result card contains 'Foodie Agent' and was created less than a minute ago");
    } 
    else 
    {
        if (resultTitle.trim() !== "Foodie Agent") 
        {
            console.error("❌ Expected 'Foodie Agent', but found: '${resultTitle}'");
        }
        if (resultText.trim() !== "Created less than a minute ago") {
            console.error("❌ Expected 'Created less than a minute ago', but found: '${resultText}'");
        }
        throw new Error("❌ Test Failed")
    }
  } 
  catch (error) 
  {
    console.error("❌ Test Failed", error);
  } 
  finally 
  {
    if (browser) await browser.close();
  }
}

createFoodieAgent();