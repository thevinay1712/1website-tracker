let isSelectionModeActive = false;
let lastHighlightedElement = null;

const highlightElement = (event) => {
  const target = event.target;
  if (lastHighlightedElement) {
    lastHighlightedElement.classList.remove('tracker-highlight');
  }
  target.classList.add('tracker-highlight');
  lastHighlightedElement = target;
};

const removeHighlight = () => {
  if (lastHighlightedElement) {
    lastHighlightedElement.classList.remove('tracker-highlight');
    lastHighlightedElement = null;
  }
};

function getCssSelector(element) {
  if (!(element instanceof Element)) return;
  const path = [];
  while (element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    if (element.id) {
      selector += '#' + element.id;
      path.unshift(selector);
      break;
    } else {
      let sibling = element, nth = 1;
      while (sibling = sibling.previousElementSibling) {
        if (sibling.nodeName.toLowerCase() === selector) nth++;
      }
      if (nth !== 1) selector += ":nth-of-type(" + nth + ")";
    }
    path.unshift(selector);
    element = element.parentNode;
  }
  return path.join(" > ");
}

const selectElement = (event) => {
  event.preventDefault();
  event.stopPropagation();
  
  const selector = getCssSelector(event.target);
  const initialContent = event.target.innerHTML;
  
  const data = {
    selector: selector,
    url: window.location.href,
    content: initialContent
  };
  
  chrome.storage.local.set({ tempTrackerData: data }, () => {
    chrome.runtime.sendMessage({ action: 'openConfigPage' });
  });
  
  stopSelectionMode();
};

const startSelectionMode = () => {
  isSelectionModeActive = true;
  document.body.style.cursor = 'crosshair';
  document.addEventListener('mouseover', highlightElement);
  document.addEventListener('click', selectElement, true);
};

const stopSelectionMode = () => {
  isSelectionModeActive = false;
  document.body.style.cursor = 'default';
  removeHighlight();
  document.removeEventListener('mouseover', highlightElement);
  document.removeEventListener('click', selectElement, true);
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startSelection" && !isSelectionModeActive) {
    startSelectionMode();
  }
});