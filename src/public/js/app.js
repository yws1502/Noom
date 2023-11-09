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

let myPeerConnection;

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

  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];

    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");

    videoSender.replaceTrack(videoTrack);
  }
}

muteBtn.addEventListener("click", handleMuteClick);

cameraBtn.addEventListener("click", handleCameraClick);

camerasSelect.addEventListener("input", handleCameraChange);

// -------------- Welcome Form  (join a room) -------------- //
const welcome = document.querySelector("#welcome");

const welcomeForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;

  call.hidden = false;

  await getMedia();

  makeConnection();
}

async function handleWelcomeSubmit(event) {
  event.preventDefault();

  const input = welcomeForm.querySelector("input");

  await initCall();

  socket.emit("join_room", input.value);

  roomName = input.value;

  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// ---------------------- Socket Code ---------------------- //

// This execute left browser
socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer();

  myPeerConnection.setLocalDescription(offer);

  console.log("Sent the offer from left browser");

  socket.emit("offer", offer, roomName);
});

// This execute right browser
socket.on("offer", async (offer) => {
  console.log("Received the offer right browser");

  myPeerConnection.setRemoteDescription(offer);

  const answer = await myPeerConnection.createAnswer();

  myPeerConnection.setLocalDescription(answer);

  console.log("Sent the answer from right browser");

  socket.emit("answer", answer, roomName);
});

// This execute left browser
socket.on("answer", (answer) => {
  console.log("Received the answer left browser");

  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});

// ----------------------- RTC Code ----------------------- //
function makeConnection() {
  myPeerConnection = new RTCPeerConnection();

  myPeerConnection.addEventListener("icecandidate", handleIce);

  myPeerConnection.addEventListener("addstream", handleAddStream);

  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  console.log("sent candidate");
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  const peerFace = document.querySelector("#peerFace");

  console.log("got an stream from my peer");
  console.log("Peer's Stream", data.stream);
  console.log("My Stream", myStream);

  peerFace.srcObject = data.stream;
}
