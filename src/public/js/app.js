const socket = io();

const welcome = document.querySelector("#welcome");

const form = welcome.querySelector("form");

const room = document.querySelector("#room");

room.hidden = true;

let roomName;

function addMessage(msg) {
  const ul = room.querySelector("ul");

  const li = document.createElement("li");

  li.textContent = msg;

  ul.appendChild(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();

  const input = room.querySelector("input");

  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${input.value}`);

    input.value = "";
  });
}

function showRoom() {
  welcome.hidden = true;

  room.hidden = false;

  const h3 = room.querySelector("h3");

  h3.textContent = `Room ${roomName}`;

  const form = room.querySelector("form");

  form.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();

  const input = form.querySelector("input");

  socket.emit("enter_room", input.value, showRoom);

  roomName = input.value;

  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", () => {
  addMessage("Someone joined!");
});

socket.on("bye", () => {
  addMessage("Someone left ㅠㅠ");
});

socket.on("new_message", addMessage);
