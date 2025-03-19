import { page, baseUrl } from "./login.js"; // Importing shared page object from login.js

// ✅ Function to switch to the "System" Administrator tenant if needed
export async function tenantSwitcher() {
  try {
    console.log("✅ Navigating to personal info page...");
    await page.goto(`${baseUrl}account-page/personal-info`, {
      waitUntil: "networkidle",
    });

    console.log("✅ Waiting for tenant table to load...");
    await page.waitForSelector(
      'h2, button[aria-label="Select"], button[aria-label="Selected"]',
      { timeout: 15000 }
    );

    console.log("✅ Searching for 'System' with role 'Administrator'...");

    // Find all organization rows
    await page.waitForSelector("tbody tr", { timeout: 15000 });
    const rows = await page.$$("tbody tr");

    for (let row of rows) {
      // Extract organization name and role from each row
      const orgNameElement = await row.$("td:nth-child(1) h2");
      const roleElement = await row.$("td:nth-child(2) h2");

      if (!orgNameElement || !roleElement) continue;

      const orgName = await page.evaluate(
        (el) => el.textContent.trim(),
        orgNameElement
      );
      const role = await page.evaluate(
        (el) => el.textContent.trim(),
        roleElement
      );

      console.log(`🔍 Checking: ${orgName} - ${role}`);

      if (orgName === "System" && role === "Administrator") {
        console.log("✅ 'System' Administrator found!");

        // Locate the button inside the same row
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
              "✅ Clicking 'Switch' to change to 'System' Administrator tenant..."
            );
            await button.click();
            await page.waitForLoadState("networkidle");

            // ✅ Verify the switch was successful
            await page.waitForSelector(
              'button[aria-label="Selected"]:has-text("Selected")',
              { timeout: 15000 }
            );
            console.log("✅ Successfully switched to 'System' Administrator");
          } else {
            console.log(
              "✅ Already in 'System' Administrator. No switch needed."
            );
          }
          return; // Exit function once action is taken
        }
      }
    }

    throw new Error("❌ 'System' Administrator not found or button missing.");
  } catch (error) {
    console.error("❌ Error during tenant switching:", error);
    throw error;
  }
}
