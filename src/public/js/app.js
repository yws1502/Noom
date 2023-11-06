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

  const input = room.querySelector("#msg input");

  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${input.value}`);

    input.value = "";
  });
}
function handleNicknameSubmit(event) {
  event.preventDefault();

  const input = room.querySelector("#name input");

  socket.emit("nickname", input.value);
}

function showRoom() {
  welcome.hidden = true;

  room.hidden = false;

  const h3 = room.querySelector("h3");

  h3.textContent = `Room ${roomName}`;

  const msgForm = room.querySelector("#msg");

  msgForm.addEventListener("submit", handleMessageSubmit);

  const nameForm = room.querySelector("#name");

  nameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();

  const input = form.querySelector("input");

  socket.emit("enter_room", input.value, showRoom);

  roomName = input.value;

  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
  addMessage(`${user} arrived!`);
});

socket.on("bye", (left) => {
  addMessage(`${left} left ㅠㅠ`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";

  if (rooms.length === 0) {
    return;
  }

  rooms.forEach((room) => {
    const li = document.createElement("li");

    li.textContent = room;

    roomList.append(li);
  });
});
