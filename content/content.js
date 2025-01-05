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
      showModal(selectedText); // Show modal with selected text
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

// Function to show the modal with the selected text
function showModal(selectedText) {
  // Check if a modal already exists, remove it if so
  const existingModal = document.getElementById("customModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Create a modal dynamically using innerHTML
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
        justify-content: space-between;
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

      label {
        color: #3dae9c;
      }

      /* Hide the default radio button */
      input[type="radio"] {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        width: 10px;
        height: 10px;
        border: 1px solid #3dae9c; /* Border of the radio button */
        border-radius: 10%; /* Circular border */
        position: relative;
        cursor: pointer;
        background-color: white; /* Background color of the radio button */
      }
  
      /* Create the dot inside the radio button when it's checked */
      input[type="radio"]:checked::before {
        content: '';
        position: absolute;
        top: 50%; /* Position the dot */
        left: 50%; /* Position the dot */
        width: 5px; /* Size of the dot */
        height: 5px; /* Size of the dot */
        border-radius: 10%; /* Make the dot circular */
        background-color: #3dae9c; /* Change this to your desired color */
        transform: translate(-50%, -50%); /* Center the dot */
      }
    </style>
    
    <div class="modal" id="modal">
      <div class="modal-header">
        <div class="title">Smart Summarizer</div>
        <button id="closeModal" data-close-button class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        ${selectedText}
      </div>
      <div class="modal-footer">
        <label>
          <input type="radio" name="summaryType" value="Extractive"> Extractive
        </label>
        <label>
          <input type="radio" name="summaryType" value="Abstractive" checked> Abstractive
        </label>
        <label>
          <input type="radio" name="summaryType" value="Hybrid"> Hybrid
        </label>
        <button type="button" class="button" id="summarizeButton">Summarize</button>
        <button type="button" class="button" id="historyButton">History</button>
      </div>
    </div>
    <div id="overlay"></div>
  `;

  // Add the modal to the document body
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  const modal = document.querySelector(".modal");
  openModal(modal);

  // Add event listener to close the modal
  document.getElementById("closeModal").addEventListener("click", () => {
    const modal = document.getElementById("modal");
    closeModal(modal);
  });

  // Add event listener to summarize button
  document.getElementById("summarizeButton").addEventListener("click", () => {
    sendMessageWithRetry({ action: "summarizeText", text: selectedText });
  });

  // Add event listener to history button
  document.getElementById("historyButton").addEventListener("click", () => {
    window.open("history.html", "_blank");
  });
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
