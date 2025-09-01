document.addEventListener('DOMContentLoaded', () => {
    const urlDisplay = document.getElementById('urlDisplay');
    const selectorDisplay = document.getElementById('selectorDisplay');
    const intervalSelect = document.getElementById('intervalSelect');
    const saveTrackerBtn = document.getElementById('saveTrackerBtn');
    let trackerData = {};

    // 1. Get the temporary data that content.js saved
    chrome.storage.local.get('tempTrackerData', (result) => {
        if (result.tempTrackerData) {
            trackerData = result.tempTrackerData;
            urlDisplay.textContent = new URL(trackerData.url).hostname;
            selectorDisplay.textContent = trackerData.selector;
        }
    });

    // 2. Listen for the save button click

    saveTrackerBtn.addEventListener('click', () => {
    trackerData.interval = intervalSelect.value;
    
    // Just send the message. The background script will handle the rest.
    chrome.runtime.sendMessage({ action: 'saveNewTracker', payload: trackerData });

    // We can also clean up the temp data here immediately
    chrome.storage.local.remove('tempTrackerData');
});
});