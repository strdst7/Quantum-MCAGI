"use strict";

const API_BASE = "http://127.0.0.1:8000";
const SESSION_KEY = "quantum-mcagi-session";

const connection = document.querySelector("#connection");
const connectionLabel = connection.querySelector(".connection-label");
const sessionList = document.querySelector("#session-list");
const conversation = document.querySelector("#conversation");
const welcome = document.querySelector("#welcome");
const messageList = document.querySelector("#message-list");
const composer = document.querySelector("#composer");
const messageInput = document.querySelector("#message-input");
const sendButton = document.querySelector("#send-button");
const errorMessage = document.querySelector("#error-message");

let activeSession = localStorage.getItem(SESSION_KEY);
let isSending = false;

function setConnection(state, label) {
  connection.dataset.state = state;
  connectionLabel.textContent = label;
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Could not reach the local API. Make sure it is running on port 8000.");
  }

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail = typeof body === "object" && body !== null
      ? body.detail || body.message
      : body;
    throw new Error(detail || `Request failed with status ${response.status}.`);
  }

  return body;
}

async function checkConnection() {
  try {
    await request("/api/health");
    setConnection("online", "API connected");
  } catch {
    setConnection("offline", "API unavailable");
  }
}

function addMessage(role, content, { pending = false } = {}) {
  const article = document.createElement("article");
  article.className = `message ${role}${pending ? " pending" : ""}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = role === "user" ? "Y" : "Q";

  const body = document.createElement("div");
  body.className = "message-content";

  const label = document.createElement("p");
  label.className = "message-role";
  label.textContent = role === "user" ? "You" : "Quantum MCAGI";

  const text = document.createElement("p");
  text.className = "message-text";
  text.textContent = content;

  body.append(label, text);
  article.append(avatar, body);
  messageList.append(article);
  welcome.hidden = true;
  conversation.scrollTop = conversation.scrollHeight;
  return article;
}

function formatSessionTitle(session) {
  return session.title || session.last_message_content || "Conversation";
}

function renderSessions(sessions) {
  sessionList.replaceChildren();

  if (!sessions.length) {
    const empty = document.createElement("p");
    empty.className = "sidebar-message";
    empty.textContent = "Your conversations will appear here.";
    sessionList.append(empty);
    return;
  }

  for (const session of sessions) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "session-button";
    button.setAttribute("aria-current", String(session.session_id === activeSession));
    button.addEventListener("click", () => openSession(session.session_id));

    const title = document.createElement("span");
    title.className = "session-title";
    title.textContent = formatSessionTitle(session);

    const meta = document.createElement("span");
    meta.className = "session-meta";
    meta.textContent = `${session.message_count || 0} messages`;

    button.append(title, meta);
    sessionList.append(button);
  }
}

async function loadSessions() {
  try {
    const result = await request("/api/chat/sessions");
    renderSessions(result.sessions || []);
  } catch (error) {
    sessionList.replaceChildren();
    const message = document.createElement("p");
    message.className = "sidebar-message";
    message.textContent = error.message;
    sessionList.append(message);
  }
}

async function openSession(sessionId) {
  activeSession = sessionId;
  localStorage.setItem(SESSION_KEY, sessionId);
  messageList.replaceChildren();
  hideError();
  try {
    const result = await request(`/api/chat/history/${encodeURIComponent(sessionId)}`);
    for (const message of result.messages || []) {
      if (message.role === "user" || message.role === "assistant") {
        addMessage(message.role, message.content || "");
      }
    }
    welcome.hidden = messageList.childElementCount > 0;
    await loadSessions();
  } catch (error) {
    showError(error.message);
  }
}

function startNewConversation() {
  activeSession = null;
  localStorage.removeItem(SESSION_KEY);
  messageList.replaceChildren();
  welcome.hidden = false;
  hideError();
  messageInput.focus();
  void loadSessions();
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function hideError() {
  errorMessage.textContent = "";
  errorMessage.hidden = true;
}

function resizeInput() {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 180)}px`;
}

async function sendMessage(content) {
  if (isSending || !content.trim()) return;
  isSending = true;
  sendButton.disabled = true;
  hideError();
  addMessage("user", content);
  messageInput.value = "";
  resizeInput();

  const pendingMessage = addMessage("assistant", "Thinking", { pending: true });

  try {
    const result = await request("/api/quantum/chat", {
      method: "POST",
      body: JSON.stringify({
        content,
        mode: "quantum",
        session_id: activeSession,
      }),
    });
    pendingMessage.remove();
    addMessage("assistant", result.response || "The API returned an empty response.");
    if (result.session_id) {
      activeSession = result.session_id;
      localStorage.setItem(SESSION_KEY, activeSession);
    }
    await loadSessions();
  } catch (error) {
    pendingMessage.remove();
    showError(error.message);
  } finally {
    isSending = false;
    sendButton.disabled = false;
    messageInput.focus();
  }
}

composer.addEventListener("submit", (event) => {
  event.preventDefault();
  void sendMessage(messageInput.value);
});

messageInput.addEventListener("input", resizeInput);
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    composer.requestSubmit();
  }
});

document.querySelector("#new-chat").addEventListener("click", startNewConversation);
document.querySelector("#refresh-history").addEventListener("click", () => void loadSessions());

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    messageInput.value = button.dataset.prompt || "";
    resizeInput();
    composer.requestSubmit();
  });
});

void checkConnection();
void loadSessions();
if (activeSession) void openSession(activeSession);
window.setInterval(() => void checkConnection(), 30000);
