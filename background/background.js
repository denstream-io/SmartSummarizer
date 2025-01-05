importScripts("../lib/axios.min.js"); // Import the Axios library for making HTTP requests
importScripts("storage.js"); // Imports the functions to store user preferences from handlers.js

// const dotenv = require("dotenv"); // Import dotenv to load environment variables (optional if not used)

// Load environment variables from .env file
// dotenv.config();

// OpenAI API key (replace with your actual API key or load it from environment variables for security)
const OPENAI_API_KEY = "";

// Variable to store received text

let receivedText = "";

// Get the prompt text (text to be summarized) from contentscript.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendSelectedText") {
    console.log("Received selected text:", message.text);
    receivedText = message.text;

    // Write logic to summarize text and send it back to frontend

    sendResponse({ status: "Text recieved" });
  }
});

/**
 * Summarizes a given text using the OpenAI ChatGPT API.
 *
 * @param {string} prompt - The text or instructions for the AI to summarize.
 * @returns {Promise<string>} - The summarized text returned by the OpenAI API.
 * @throws {Error} - Throws an error if the API call fails.
 */
async function summerizeText(prompt) {
  // OpenAI API endpoint for chat-based completions
  const url = "https://api.openai.com/v1/chat/completions";

  // HTTP headers for the API request
  const headers = {
    "Content-Type": "application/json", // Specify the type of data being sent
    Authorization: `Bearer ${OPENAI_API_KEY}`, // Include the API key for authentication
  };

  // Data payload for the API request
  const data = {
    model: "gpt-4o-mini", // Specify the OpenAI model to use (adjust as needed)
    messages: [
      { role: "system", content: "You are a helpful assistant." }, // System message for initial behavior
      { role: "user", content: prompt }, // User-provided prompt or input text
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

const HYBRID_PROMPT =
  "Summarize the following text using a\
  hybrid approach, combining both extractive and abstractive\
  techniques. Identify the most important sentences from the\
  original text and rephrase them into a more concise and\
  cohesive summary. Here is the text:\
  ${prompt}";

const summary = summerizeText(HYBRID_PROMPT);
console.log(summary);
