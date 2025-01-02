// Function to handle when the user presses Ctrl+Shift+S
function handleKeyPress(event) {
    // Checks if the user pressed Ctrl+Shift+S
    if (event.ctrlKey && event.shiftKey && event.key === 'S') {
      const selectedText = window.getSelection().toString().trim();
      // Checks for selected text
      if (selectedText) {
        console.log('Selected text:', selectedText);
        // Sends the selected text to background.js
        chrome.runtime.sendMessage({ action: 'sendSelectedText', text: selectedText });
      } else {
        console.log('No text selected!');
      }
    }
  }
  
  // Adds event listener for keydown to detect Ctrl+Shift+S
  document.addEventListener('keydown', handleKeyPress);
  