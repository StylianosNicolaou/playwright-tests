import { page, baseUrl } from "./login.js"; // Importing shared page object from login.js

// ✅ Function to switch to the "Developer" tenant if needed
export async function tenantSwitcher() {
  try {
    console.log("✅ Navigating to personal info page...");
    await page.goto(`${baseUrl}account-page/personal-info`, {
      waitUntil: "networkidle",
    });

    console.log("✅ Waiting for tenant headings and buttons...");
    await page.waitForSelector(
      'h2, button[aria-label="Select"], button[aria-label="Selected"]',
      { timeout: 5000 }
    );

    console.log("✅ Finding the 'Developer' tenant...");

    // Wait for and find all h2 elements
    await page.waitForSelector("h2", { timeout: 5000 });
    const headings = await page.$$("h2");
    let developerButton = null;

    for (let heading of headings) {
      const text = await page.evaluate((el) => el.textContent.trim(), heading);
      if (text === "Developer") {
        console.log("✅ 'Developer' tenant found");

        // Find the parent row containing this heading
        const row = await heading.evaluateHandle((el) => el.closest("tr"));

        if (row) {
          // Locate the button inside the same row
          await page.waitForSelector(
            'button[aria-label="Selected"], button[aria-label="Select"]',
            { timeout: 5000 }
          );
          const button = await row.$(
            'button[aria-label="Selected"], button[aria-label="Select"]'
          );

          if (button) {
            const buttonText = await page.evaluate(
              (el) => el.textContent.trim(),
              button
            );
            console.log(`✅ Found button with text: "${buttonText}"`);

            if (buttonText === "Switch") {
              console.log(
                "✅ Clicking 'Switch' to change to 'Developer' tenant..."
              );
              await button.click();
              await page.waitForLoadState("networkidle");

              // ✅ Verify the switch was successful
              await page.waitForSelector(
                'button[aria-label="Selected"]:has-text("Selected")',
                { timeout: 5000 }
              );
              console.log("✅ Successfully switched to 'Developer' tenant");
            } else {
              console.log(
                "✅ Already in 'Developer' tenant. No switch needed."
              );
            }
            return; // Exit function once action is taken
          }
        }
      }
    }

    throw new Error("❌ 'Developer' tenant not found or button missing.");
  } catch (error) {
    console.error("❌ Error during tenant switching:", error);
    throw error;
  }
}
