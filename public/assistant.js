/**
 * Meri Assistant Client Interaction Logic (Vanilla JS)
 * (§18–§21, §23–§24, §29)
 *
 * Implements client-side interaction:
 * 1. Clicking any "Try asking" pill inserts its string into the text input and focuses the input.
 * 2. Form submit: Appends user message bubble to #assistant-feed, clears input, and smoothly scrolls to newest message.
 */

(function () {
  function initMeriAssistant() {
    const feed = document.getElementById("assistant-feed");
    const form = document.getElementById("chat-form");
    const input =
      document.getElementById("chat-input") ||
      (form ? form.querySelector("input") : null);
    const sendBtn =
      document.getElementById("send-button") ||
      (form ? form.querySelector("button[type='submit']") : null);
    const pillsContainer = document.getElementById("suggestion-pills");

    if (!feed || !form || !input) {
      return;
    }

    // Scroll helper
    function scrollToBottom() {
      feed.scrollTo({
        top: feed.scrollHeight,
        behavior: "smooth",
      });
    }

    // Update send button state based on text presence
    function updateSendButtonState() {
      if (!sendBtn) return;
      const hasText = input.value.trim().length > 0;
      if (hasText) {
        sendBtn.classList.remove("bg-surface-strong", "text-faint", "cursor-not-allowed");
        sendBtn.classList.add(
          "bg-accent",
          "text-white",
          "shadow-[0_0_14px_rgba(254,105,4,0.45)]",
          "cursor-pointer"
        );
        sendBtn.removeAttribute("disabled");
      } else {
        sendBtn.classList.add("bg-surface-strong", "text-faint", "cursor-not-allowed");
        sendBtn.classList.remove(
          "bg-accent",
          "text-white",
          "shadow-[0_0_14px_rgba(254,105,4,0.45)]",
          "cursor-pointer"
        );
        sendBtn.setAttribute("disabled", "true");
      }
    }

    input.addEventListener("input", updateSendButtonState);

    // 1. Suggestion Pills Click Logic
    if (pillsContainer) {
      pillsContainer.addEventListener("click", function (event) {
        const target = event.target.closest("button");
        if (!target) return;
        const text = target.textContent.trim();
        if (text && text !== "Try asking:") {
          input.value = text;
          updateSendButtonState();
          input.focus();
        }
      });
    }

    // 2. User Bubble Generator
    function createUserBubble(text) {
      const bubbleWrapper = document.createElement("div");
      bubbleWrapper.className = "flex justify-end animate-enter-up";
      bubbleWrapper.innerHTML = `
        <div class="user-feed-bubble max-w-[85%] sm:max-w-[70%]">
          ${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </div>
      `;
      return bubbleWrapper;
    }

    // 3. Form Submit Handler (Appends user bubble and clears input, no mock response cards)
    window.meriHandleSubmit = function (userText) {
      const trimmed = (userText || input.value).trim();
      if (!trimmed) return;

      // Append user bubble
      const userBubble = createUserBubble(trimmed);
      feed.appendChild(userBubble);

      // Clear input
      input.value = "";
      updateSendButtonState();
      scrollToBottom();
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      window.meriHandleSubmit();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMeriAssistant);
  } else {
    initMeriAssistant();
  }

  window.initMeriAssistant = initMeriAssistant;
})();
