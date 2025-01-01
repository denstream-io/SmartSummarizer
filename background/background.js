const axios = require("axios");
// const dotenv = require("dotenv");

// Load environment variables from .env file
//dotenv.config();

// OpenAI API key
const OPENAI_API_KEY = "";


async function summerizeText(prompt) {
    const url = "https://api.openai.com/v1/chat/completions";

    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
    };

    const data = {
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
        ],
    };

    try {
        const response = await axios.post(url, data, { headers });
        const result = response.data.choices[0].message.content;
        return result;
    } catch (error) {
        console.error(
            "Error calling ChatGPT API:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
}





const HYBRID_PROMPT = "Summarize the following text using a\
  hybrid approach, combining both extractive and abstractive\
  techniques. Identify the most important sentences from the\
  original text and rephrase them into a more concise and\
  cohesive summary. Here is the text:\
  ${prompt}"
