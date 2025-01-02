// Get User Preference (for setting default) from UI Modules

// Sets the user preferred method
function saveUserPreference(method) {
  chrome.storage.sync.set({ preferredMethod: method }, () => {
    console.log("User preference saved");
  });
}

// Gets the user preferred method
function getUserPreference(callback) {
  chrome.storage.sync.get("preferredMethod", (data) => {
    const preferredMethod = data.preferredMethod || "abstractive";
    console.log(`User preferred method is : ${preferredMethod}`);
  });
}

module.exports = { saveUserPreference, getUserPreference };
