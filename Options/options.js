document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get(["defaultMethod", "toggleState"], (data) => {
        const defaultMethod = data.defaultMethod || null;
        const toggleState = data.toggleState || 0;

        const dropdown = document.getElementById("default-method");
        const toggle = document.getElementById("toggle-method");

        if (!defaultMethod) {
            dropdown.disabled = false;
            toggle.disabled = true;
        } else {
            dropdown.value = defaultMethod;
            dropdown.disabled = true;
            toggle.disabled = false;
            updateToggleState(defaultMethod, toggleState);
        }
    });
});

document.getElementById("save-settings").addEventListener("click", () => {
    const dropdown = document.getElementById("default-method");
    const defaultMethod = dropdown.value;
    if (!defaultMethod) {
        alert("Please select a default summarization method.");
        return;
    }
    chrome.storage.sync.set({ defaultMethod, toggleState: 0 }, () => {
        const message = document.getElementById("confirmation-message");
        message.textContent = "Settings Saved Successfully!";
        setTimeout(() => (message.textContent = ""), 3000);

        dropdown.disabled = true;
        document.getElementById("toggle-method").disabled = false;

        updateToggleState(defaultMethod, 0);
    });
});


document.getElementById("toggle-method").addEventListener("change", () => {
    const toggleInput = document.getElementById("toggle-method");
    const currentPosition = parseInt(toggleInput.dataset.position || "0", 10);
    const nextPosition = (currentPosition + 1) % 2;
    toggleInput.dataset.position = nextPosition;

    chrome.storage.sync.get("defaultMethod", (data) => {
        const defaultMethod = data.defaultMethod;
        const methods = ["extractive", "abstractive", "hybrid"];
        const remainingMethods = methods.filter((method) => method !== defaultMethod);

        const selectedMethod = remainingMethods[nextPosition];
        document.getElementById("default-method").value = selectedMethod;

        chrome.storage.sync.set({ toggleState: nextPosition });
    });
});

function updateToggleState(defaultMethod, position) {
    const methods = ["extractive", "abstractive", "hybrid"];
    const remainingMethods = methods.filter((method) => method !== defaultMethod);

    const currentMethod = remainingMethods[position];
    document.getElementById("default-method").value = currentMethod;

    const toggleInput = document.getElementById("toggle-method");
    toggleInput.dataset.position = position;
}
