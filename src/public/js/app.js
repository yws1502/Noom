const socket = io();

const myFace = document.querySelector("#myFace");

const muteBtn = document.querySelector("#mute");

const cameraBtn = document.querySelector("#camera");

const camerasSelect = document.querySelector("#cameras");

const call = document.querySelector("#call");

call.hidden = true;

let myStream;

let muted = false;

let cameraOff = false;

let roomName;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const cameras = devices.filter((device) => device.kind === "videoinput");

    const currentCamera = myStream.getVideoTracks()[0];

    cameras.forEach((camera) => {
      const option = document.createElement("option");

      option.value = camera.deviceId;

      option.innerText = camera.label;

      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch (error) {
    console.log(error);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };

  const cameraConstrains = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initialConstrains
    );

    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (error) {
    console.log(error);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));

  muted = !muted;
  if (!muted) {
    muteBtn.innerText = "Unmute";
  } else {
    muteBtn.innerText = "Mute";
  }
}

function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));

  cameraOff = !cameraOff;
  if (!cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
  } else {
    cameraBtn.innerText = "Turn Camera On";
  }
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);

cameraBtn.addEventListener("click", handleCameraClick);

camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form  (join a room)
const welcome = document.querySelector("#welcome");

const welcomeForm = welcome.querySelector("form");

async function startMedia() {
  welcome.hidden = true;

  call.hidden = false;

  await getMedia();
}

function handleWelcomeSubmit(event) {
  event.preventDefault();

  const input = welcomeForm.querySelector("input");

  socket.emit("join_room", input.value, startMedia);

  roomName = input.value;

  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code
socket.on("welcome", () => {
  console.log("someone joined");
});
