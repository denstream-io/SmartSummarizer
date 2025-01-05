let eventListenerAdded = false;

// Function to handle when the user presses Ctrl+Shift+S
function handleKeyPress(event) {
  if (event.ctrlKey && event.shiftKey && event.key === "S") {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      console.log("Selected text:", selectedText);
      showModal(selectedText); // Show modal with selected text
    } else {
      console.log("No text selected!");
    }
  }
}

// Function to send a message with retry logic
function sendMessageWithRetry(message, retries = 5) {
  try {
    if (chrome.runtime && chrome.runtime.sendMessage) {
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
    } else {
      console.error("Extension context invalidated. Cannot send message.");
    }
  } catch (error) {
    console.error("Error in sendMessageWithRetry:", error);
  }
}

// Function to show the modal with the selected text
function showModal(selectedText) {
  const existingModal = document.getElementById("customModal");
  if (existingModal) {
    existingModal.remove();
  }

  const modalHTML = `
    <style>
      *, *::after, *::before {
        box-sizing: border-box;
      }

      .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        transition: 200ms ease-in-out;
        border-radius: 10px;
        z-index: 10;
        background-color: white;
        width: 500px;
        max-width: 80%;
      }

      .modal.active {
        transform: translate(-50%, -50%) scale(1);
      }

      .modal-header {
        padding: 10px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #ffffff;
        color: #3dae9c;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        margin-top: 10px;
      }

      .modal-footer {
        padding: 10px 15px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #ffffff;
        color: #002F55;
        border-bottom-right-radius: 10px;
        border-bottom-left-radius: 10px;
        font-family: 'Roboto', sans-serif;
        font-size: 0.9rem;
        margin-bottom: 10px;
      }

      .modal-header .title {
        font-family: 'Roboto', sans-serif;
        font-size: 1rem;
        font-weight: bold;
      }

      .modal-footer .button {
        border-radius: 2px;
        border: none;
        padding: 5px 10px;
        background-color: #3dae9c;
        color: #ffffff;
        font-family: 'Roboto', sans-serif;
        margin-top: 10px;
      }

      .modal-footer .button:hover {
        background-color: #2e8375;
        color: #ffffff;
        cursor: pointer;
      }

      .modal-footer .button:active {
        background-color: #3dae9c;
        color: #ffffff;
      }

      .modal-header .close-button {
        cursor: pointer;
        border: none;
        outline: none;
        background: none;
        font-weight: bold;
        font-size: 1.25rem;
        color: #3dae9c;
      }

      .modal-body {
        padding: 5px 15px 10px 15px;
        color: #000000;
        max-height: 30vh; /* Limit height to 30% of viewport height */
        overflow-y: auto; /* Enable vertical scrolling if content overflows */
      }

      #overlay {
        position: fixed;
        opacity: 0;
        transition: 200ms ease-in-out;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        pointer-events: none;
      }

      #overlay.active {
        opacity: 1;
        pointer-events: all;
      }
    </style>
    
    <div class="modal" id="customModal">
      <div class="modal-header">
        <div class="title">Smart Summarizer</div>
        <button id="closeModal" data-close-button class="close-button">&times;</button>
      </div>
      <div class="modal-body" id="modalBody">
        ${selectedText}
      </div>
      <div class="modal-footer">
        <button type="button" class="button" id="summarizeButton">Summarize</button>
      </div>
    </div>
    <div id="overlay"></div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  const modal = document.querySelector(".modal");
  openModal(modal);

  // Ensure elements exist before adding event listeners
  const closeModalButton = document.getElementById("closeModal");
  const summarizeButton = document.getElementById("summarizeButton");

  if (closeModalButton) {
    closeModalButton.addEventListener("click", () => {
      closeModal(modal);
    });
  } else {
    console.error("Close modal button not found.");
  }

  if (summarizeButton) {
    summarizeButton.addEventListener("click", () => {
      try {
        const selectedText = document.querySelector("#modalBody").innerText;
        console.log("Summarize button clicked with text:", selectedText);
        sendMessageWithRetry({
          action: "sendSelectedText",
          text: selectedText,
        });
      } catch (error) {
        console.error("Error in summarizeButton click event:", error);
      }
    });
  } else {
    console.error("Summarize button not found.");
  }
}

// Function to update the modal content
function updateModalContent(summary) {
  try {
    const modalBody = document.getElementById("modalBody");
    if (modalBody) {
      modalBody.innerText = summary;
    }
  } catch (error) {
    console.error("Error in updateModalContent:", error);
  }
}

// Function to close the modal
function closeModal(modal) {
  if (modal == null) return;
  modal.classList.remove("active");
  document.getElementById("overlay").classList.remove("active");
}

// Function to open the modal
function openModal(modal) {
  if (modal == null) return;
  modal.classList.add("active");
  document.getElementById("overlay").classList.add("active");
}

// Adds event listener for keydown to detect Ctrl+Shift+S
if (!eventListenerAdded) {
  document.addEventListener("keydown", handleKeyPress);
  eventListenerAdded = true;
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "receiveSummary") {
    console.log("Received summary from background script:", message.summary);
    updateModalContent(message.summary);
  }
});
