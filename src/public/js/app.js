const socket = io();

const myFace = document.querySelector("#myFace");

const muteBtn = document.querySelector("#mute");

const cameraBtn = document.querySelector("#camera");

let myStream;

let muted = false;

let cameraOff = false;

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    myFace.srcObject = myStream;
  } catch (error) {
    console.log(error);
  }
}

getMedia();

function handleMuteClick() {
  muted = !muted;
  if (!muted) {
    muteBtn.innerText = "Unmute";
  } else {
    muteBtn.innerText = "Mute";
  }
}

function handleCameraClick() {
  cameraOff = !cameraOff;
  if (!cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
  } else {
    cameraBtn.innerText = "Turn Camera On";
  }
}

muteBtn.addEventListener("click", handleMuteClick);

cameraBtn.addEventListener("click", handleCameraClick);
