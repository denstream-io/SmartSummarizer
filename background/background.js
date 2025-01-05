importScripts("../lib/axios.min.js"); // Import the Axios library for making HTTP requests
importScripts("storage.js"); // Imports the functions to store user preferences from handlers.js

// OpenAI API key (replace with your actual API key or load it from environment variables for security)
const OPENAI_API_KEY =
  // Get the prompt text (text to be summarized) from contentscript.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background script received a message:", message);
    if (message.action === "sendSelectedText") {
      console.log("Received selected text:", message.text);

      // Summarize the text and send it back to the frontend
      summarizeText(message.text)
        .then((summary) => {
          sendResponse({ summary: summary });

          // Send the summary back to the content script
          chrome.tabs.sendMessage(
            sender.tab.id,
            { action: "receiveSummary", summary: summary },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Error sending message to content script:",
                  chrome.runtime.lastError.message
                );
              } else {
                console.log("Summary sent to content script:", response);
              }
            }
          );
        })
        .catch((error) => {
          console.error("Error summarizing text:", error);
          sendResponse({
            summary: "An error occurred while summarizing the text.",
          });
        });

      return true; // Will respond asynchronously
    }

    return false; // Indicate that no response will be sent
  });

/**
 * Summarizes a given text using the OpenAI ChatGPT API.
 *
 * @param {string} prompt - The text or instructions for the AI to summarize.
 * @returns {Promise<string>} - The summarized text returned by the OpenAI API.
 * @throws {Error} - Throws an error if the API call fails.
 */
async function summarizeText(prompt) {
  // OpenAI API endpoint for chat-based completions
  const url = "https://api.openai.com/v1/chat/completions";

  // HTTP headers for the API request
  const headers = {
    "Content-Type": "application/json", // Specify the type of data being sent
    Authorization: `Bearer ${OPENAI_API_KEY}`, // Include the API key for authentication
  };

  // Data payload for the API request
  const data = {
    model: "gpt-3.5-turbo", // Specify the OpenAI model to use (adjust as needed)
    messages: [
      { role: "system", content: "You are a helpful assistant." }, // System message for initial behavior
      {
        role: "user",
        content: `Generate an abstractive summary from the following text : ${prompt} In the response please say , this is the summary of the text : `,
      }, // User-provided prompt or input text
    ],
  };

  try {
    // Make a POST request to the OpenAI API with the headers and data
    const response = await axios.post(url, data, { headers });

    // Extract the summarized content from the API response
    const summary = response.data.choices[0].message.content;

    return summary; // Return the summarized text
  } catch (error) {
    // Log an error message with details if the API call fails
    console.error(
      "Error calling ChatGPT API:",
      error.response ? error.response.data : error.message
    );

    // Re-throw the error so it can be handled by the calling function
    throw error;
  }
}
