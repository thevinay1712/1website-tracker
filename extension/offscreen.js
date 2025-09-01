chrome.runtime.onMessage.addListener(handleMessages);

function handleMessages(request, sender, sendResponse) {
  if (request.target !== 'offscreen') {
    return;
  }

  if (request.action === 'parseHTML') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(request.payload.html, 'text/html');
      const element = doc.querySelector(request.payload.selector);

      if (element) {
        // NORMALIZE: Get only the visible text and remove all whitespace/newlines.
        const normalizedText = element.textContent.replace(/\s+/g, '').trim();
        sendResponse({ content: normalizedText });
      } else {
        // If the element isn't found, return null.
        sendResponse({ content: null });
      }
    } catch (e) {
      console.error('Offscreen parsing error:', e);
      sendResponse({ content: null });
    }
    // Return true to indicate you wish to send a response asynchronously.
    return true; 
  }
}