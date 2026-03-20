import { InstallationIdManager } from './installation_id.js';

// ==================== UNIVERSAL USER-AGENT SPOOFING ====================
// This ensures ALL users get the EXACT SAME Facebook UI regardless of their platform
// Forces Facebook to serve Windows Chrome UI to everyone for consistent element detection

/**
 * Sets up UNIVERSAL User-Agent spoofing for Facebook - applies to ALL users
 */
async function setupUserAgentSpoofing() {
  console.log('User-Agent spoofing disabled for safety.');
}


// Universal User-Agent Spoofing has been disabled.


// ==================== END UNIVERSAL USER-AGENT SPOOFING ====================

/**
 * Injects content scripts into existing Facebook tabs upon installation
 * This allows the extension to work immediately without requiring a refresh
 */
async function injectContentScriptsIntoFacebookTabs() {
  console.log('Attempting to inject content scripts into open Facebook tabs...');
  try {
    const tabs = await chrome.tabs.query({ url: ['*://*.facebook.com/*', '*://facebook.com/*'] });

    if (tabs.length === 0) {
      console.log('No open Facebook tabs found to inject scripts into.');
      return;
    }

    const scripts = [
      "expired_overlay.js",
      "content_core.js",
      "content_ui_progress.js",
      "content_ui_modals.js",
      "content_ui_elements.js",
      "content_main.js"
    ];

    console.log(`Found ${tabs.length} Facebook tabs. Injecting scripts:`, scripts);

    for (const tab of tabs) {
      // Skip if the tab is restricted (e.g. chrome:// URLs)
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) continue;

      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: scripts
        });
        console.log(`Successfully injected scripts into tab ${tab.id}`);
      } catch (err) {
        // Ignore errors for tabs where we can't inject (e.g. restricted domains that matched wildcard somehow, or closed tabs)
        console.warn(`Failed to inject scripts into tab ${tab.id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('Error querying or injecting into tabs:', error);
  }
}

// Initialize unique installation ID on extension install/startup
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated - ensuring unique installation ID exists');
  InstallationIdManager.getUniqueInstallationId().then(id => {
    console.log('Unique installation ID initialized:', id);
  });

  // Setup Universal User-Agent spoofing for ALL users
  setupUserAgentSpoofing();

  // Inject scripts into open tabs if this is a fresh install or update
  // We do this for both install and update to ensure the latest scripts are running
  injectContentScriptsIntoFacebookTabs();
});

// Also initialize on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup - ensuring unique installation ID exists');
  InstallationIdManager.getUniqueInstallationId().then(id => {
    console.log('Unique installation ID confirmed:', id);
  });

  // Re-setup User-Agent spoofing on browser restart
  setupUserAgentSpoofing();
});
