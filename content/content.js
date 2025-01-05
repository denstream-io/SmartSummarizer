// content_script.js

let eventListenerAdded = false;

// Function to handle when the user presses Ctrl+Shift+S
function handleKeyPress(event) {
  // Checks if the user pressed Ctrl+Shift+S
  if (event.ctrlKey && event.shiftKey && event.key === "S") {
    const selectedText = window.getSelection().toString().trim();
    // Checks for selected text
    if (selectedText) {
      console.log("Selected text:", selectedText);
      // Sends the selected text to background.js with retry logic
      sendMessageWithRetry({ action: "sendSelectedText", text: selectedText });
    } else {
      console.log("No text selected!");
    }
  }
}

// Function to send a message with retry logic
function sendMessageWithRetry(message, retries = 5) {
  chrome.runtime.sendMessage(message, (response) => {
    if (chrome.runtime.lastError && retries > 0) {
      console.warn(
        "Retrying message due to:",
        chrome.runtime.lastError.message
      );
      setTimeout(() => sendMessageWithRetry(message, retries - 1), 1000);
    } else if (chrome.runtime.lastError) {
      console.error(
        "Failed to send message after retries:",
        chrome.runtime.lastError.message
      );
    } else {
      console.log("Message sent successfully:", response);
    }
  });
}

// Adds event listener for keydown to detect Ctrl+Shift+S
if (!eventListenerAdded) {
  document.addEventListener("keydown", handleKeyPress);
  eventListenerAdded = true;
}
