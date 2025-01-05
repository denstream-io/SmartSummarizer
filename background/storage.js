// Function to save user preferences (Summarization method)

const savePreference = (key, value) => {
  chrome.storage.local.set({ [key]: value });
};

// Function to get user preferences (Summarization method)

const getPreference = (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
};

// Function to save user summary history

const saveHistory = async (summaryData) => {
  try {
    let history = (await getPreference("history")) || [];
    history = [...history, summaryData];
    savePreference("history", history);
  } catch (error) {
    console.error("Error saving history : ", error);
  }
};

// Function to clear saved user summary history

const clearHistory = () => {
  savePreference("history", []);
};

// Function to get the saved user summary history

const getAllHistory = async () => {
  try {
    return (await getPreference("history")) || [];
  } catch (error) {
    console.log("Error retrieving the history : ", error);
    return [];
  }
};
