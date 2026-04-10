(() => {
  "use strict";

  const chatForm = document.getElementById("chat-form");
  const userInput = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  if (!chatForm || !userInput || !chatBox) {
    console.error("Missing required chat elements in DOM.");
    return;
  }

  // Keeps full conversation history in backend-required format.
  const conversation = [];

  function createMessageElement(role, text) {
    const messageEl = document.createElement("div");
    messageEl.className = `message ${role}`; // optional CSS hooks: .message.user / .message.bot
    messageEl.textContent = text;
    return messageEl;
  }

  function addMessage(role, text) {
    const messageEl = createMessageElement(role, text);
    chatBox.appendChild(messageEl);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageEl;
  }

  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = userInput.value.trim();
    if (!message) return;

    // Show user message in UI.
    addMessage("user", message);

    // Add to conversation payload.
    conversation.push({ role: "user", text: message });

    // Clear input immediately for better UX.
    userInput.value = "";
    userInput.focus();

    // Show temporary bot placeholder.
    const thinkingEl = addMessage("bot", "Thinking...");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ conversation })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const result =
        data && typeof data.response === "string" ? data.response.trim() : "";

      if (result) {
        // Replace "Thinking..." with AI reply.
        thinkingEl.innerHTML = marked.parse(data.response);

        // Persist model message for next request context.
        conversation.push({ role: "model", text: result });
      } else {
        thinkingEl.textContent = "Sorry, no response received.";
      }
    } catch (error) {
      console.error("Chat request failed:", error);
      thinkingEl.textContent = "Failed to get response from server.";
    }
  });
})();