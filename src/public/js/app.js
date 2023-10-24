const messageList = document.querySelector("ul");

const messageForm = document.querySelector("#message");

const nickForm = document.querySelector("#nick");

const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.textContent = message.data;

  messageList.append(li);
});

socket.addEventListener("close", () => {
  console.log("Disconnected from the Server ❌");
});

function handleMessageSubmit(event) {
  event.preventDefault();

  const input = messageForm.querySelector("input");

  socket.send(makeMessage("new_message", input.value));
  input.value = "";
}

messageForm.addEventListener("submit", handleMessageSubmit);

function handleNickSubmit(event) {
  event.preventDefault();

  const input = nickForm.querySelector("input");

  socket.send(makeMessage("nickname", input.value));
  input.value = "";
}

nickForm.addEventListener("submit", handleNickSubmit);
