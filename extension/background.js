// --- LISTENERS ---

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openConfigPage') {
    chrome.tabs.create({ url: chrome.runtime.getURL('config.html') });

  } else if (request.action === 'saveNewTracker') {
    // We handle this asynchronously now
    (async () => {
      await handleNewSite(request.payload);
      // After saving, close the tab that sent the message
      if (sender.tab) {
        chrome.tabs.remove(sender.tab.id);
      }
    })();
    // Return true to indicate an async response
    return true;

  } else if (request.action === 'deleteSite') {
    handleDeleteSite(request.payload.id, () => sendResponse({ status: 'deleted' }));
    return true; // Keep this for the async response

  } else if (request.action === 'updateInterval') {
    handleUpdateInterval(request.payload.id, request.payload.interval);
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  performCheck(alarm.name);
});

// --- HANDLER FUNCTIONS ---
async function handleNewSite(payload) {
  const { selector, url, content, interval } = payload;
  
  // CRUCIAL: Normalize the initial content before saving it as the first snapshot.
  // This uses a temporary HTML structure since the content is just a string.
  const initialNormalizedContent = await parseHtmlViaOffscreen(`<body>${content}</body>`, 'body');

  const newTrackedItem = {
    id: `tracker_${Date.now()}`,
    url: url,
    selector: selector,
    check_interval: interval,
    last_snapshot: initialNormalizedContent, // Save the cleaned version
    last_checked: new Date().toISOString()
  };

  const { trackedSites } = await chrome.storage.local.get({ trackedSites: [] });
  const updatedSites = [...trackedSites, newTrackedItem];
  await chrome.storage.local.set({ trackedSites: updatedSites });
  
  createAlarm(newTrackedItem.id, newTrackedItem.check_interval);
  console.log(`Saved and created alarm for new site: ${url}`);
}

async function handleDeleteSite(siteId, callback) {
  const { trackedSites } = await chrome.storage.local.get({ trackedSites: [] });
  const updatedSites = trackedSites.filter(s => s.id !== siteId);
  await chrome.storage.local.set({ trackedSites: updatedSites });
  
  chrome.alarms.clear(siteId);
  console.log(`Deleted site and alarm for ${siteId}`);
  if (callback) callback();
}

async function handleUpdateInterval(siteId, newInterval) {
  const { trackedSites } = await chrome.storage.local.get('trackedSites');
  const siteIndex = trackedSites.findIndex(s => s.id === siteId);
  if (siteIndex > -1) {
    trackedSites[siteIndex].check_interval = newInterval;
    await chrome.storage.local.set({ trackedSites });
    createAlarm(siteId, newInterval);
    console.log(`Updated interval for ${siteId} to ${newInterval}`);
  }
}

// --- CORE LOGIC ---
// Inside background.js

function createAlarm(id, interval) {
  // Add "30s": 0.5 to the map
  const intervalMap = { "30s": 0.5, "1m": 1, "10m": 10, "1h": 60, "6h": 360, "1d": 1440 };
  const periodInMinutes = intervalMap[interval];
  if (periodInMinutes) {
    chrome.alarms.create(id, { periodInMinutes });
  }
}

async function setupOffscreenDocument() {
  const path = 'offscreen.html';
  if (await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'], documentUrls: [chrome.runtime.getURL(path)] }).then(contexts => contexts.length > 0)) {
    return;
  }
  await chrome.offscreen.createDocument({
    url: path,
    reasons: ['DOM_PARSER'],
    justification: 'Required for parsing HTML strings.',
  });
}

async function parseHtmlViaOffscreen(html, selector) {
  await setupOffscreenDocument();
  const response = await chrome.runtime.sendMessage({
    action: 'parseHTML',
    target: 'offscreen',
    payload: { html, selector }
  });
  return response.content;
}

async function performCheck(trackerId) {
  try {
    const { trackedSites } = await chrome.storage.local.get({ trackedSites: [] });
    const siteIndex = trackedSites.findIndex(s => s.id === trackerId);
    if (siteIndex === -1) return;
    
    const site = trackedSites[siteIndex];
    const response = await fetch(site.url);
    if (!response.ok) return;

    const htmlText = await response.text();
    const newContent = await parseHtmlViaOffscreen(htmlText, site.selector);

    if (newContent === null) {
      console.warn(`Selector "${site.selector}" not found on ${site.url}.`);
      return;
    }
    
    const oldContent = site.last_snapshot;

    if (newContent !== oldContent) {
      console.log(`✅ Change detected for ${site.url}!`);
      await handleDetectedChange(site, oldContent, newContent);
      trackedSites[siteIndex].last_snapshot = newContent;
    } else {
      console.log(`No change detected for ${site.url}.`);
    }

    trackedSites[siteIndex].last_checked = new Date().toISOString();
    await chrome.storage.local.set({ trackedSites });

  } catch (error) {
    console.error(`Error in performCheck for ${trackerId}:`, error);
  }
}

async function handleDetectedChange(site, oldContent, newContent) {
  chrome.notifications.create({
    type: 'basic', iconUrl: 'icons/icon48.png',
    title: 'Website Change Detected!',
    message: `A change was detected on ${new URL(site.url).hostname}`
  });

  const { userEmail } = await chrome.storage.local.get('userEmail');
  if (!userEmail) return;

  const payload = {
    websiteName: new URL(site.url).hostname,
    url: site.url,
    trackedSection: site.selector,
    checkInterval: site.check_interval,
    timestamp: new Date().toLocaleString(),
    oldContent: oldContent,
    newContent: newContent,
    userEmail: userEmail
  };

  try {
    await fetch('https://website-tracker-backend.onrender.com/send-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Failed to send email alert to server:', error);
  }

}
