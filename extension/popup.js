document.addEventListener('DOMContentLoaded', () => {
  const emailInput = document.getElementById('emailInput');
  const saveEmailBtn = document.getElementById('saveEmailBtn');
  const selectElementBtn = document.getElementById('selectElementBtn');
  const trackedListContainer = document.getElementById('trackedList');

  chrome.storage.local.get('userEmail', (result) => {
    if (result.userEmail) {
      emailInput.value = result.userEmail;
    }
  });

  saveEmailBtn.addEventListener('click', () => {
    const email = emailInput.value;
    if (email) {
      chrome.storage.local.set({ userEmail: email }, () => {
        alert('Email saved!');
      });
    }
  });

  selectElementBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "startSelection" });
      window.close();
    });
  });

  trackedListContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
      const siteId = e.target.dataset.id;
      chrome.runtime.sendMessage({ action: 'deleteSite', payload: { id: siteId } }, () => {
        renderTrackedSites();
      });
    }
  });

  trackedListContainer.addEventListener('change', (e) => {
    if (e.target.tagName === 'SELECT') {
      const siteId = e.target.dataset.id;
      const newInterval = e.target.value;
      chrome.runtime.sendMessage({ action: 'updateInterval', payload: { id: siteId, interval: newInterval } });
    }
  });

  function renderTrackedSites() {
    trackedListContainer.innerHTML = '';
    chrome.storage.local.get({ trackedSites: [] }, (result) => {
      const { trackedSites } = result;
      if (trackedSites.length === 0) {
        trackedListContainer.innerHTML = '<p>No sites are being tracked.</p>';
        return;
      }
      trackedSites.forEach(site => {
        const siteDiv = document.createElement('div');
        siteDiv.className = 'site-entry';
        siteDiv.innerHTML = `
<p><strong>URL:</strong> ${new URL(site.url).hostname}</p>
  <p><strong>Selector:</strong> <code>${site.selector.substring(0, 40)}...</code></p>
  <div class="site-controls">
    <select data-id="${site.id}">
      <option value="30s" ${site.check_interval === '30s' ? 'selected' : ''}>Every 30 secs</option> <option value="1m" ${site.check_interval === '1m' ? 'selected' : ''}>Every 1 min</option>
      <option value="10m" ${site.check_interval === '10m' ? 'selected' : ''}>Every 10 min</option>
      <option value="1h" ${site.check_interval === '1h' ? 'selected' : ''}>Every 1 hr</option>
      <option value="6h" ${site.check_interval === '6h' ? 'selected' : ''}>Every 6 hrs</option>
      <option value="1d" ${site.check_interval === '1d' ? 'selected' : ''}>Every 1 day</option>
    </select>
    <button data-id="${site.id}" class="btn-delete">Delete</button>
  </div>
`;
        trackedListContainer.appendChild(siteDiv);
      });
    });
  }
  renderTrackedSites();
});