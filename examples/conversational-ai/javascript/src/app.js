// --- src/app.js ---
import { Conversation } from '@elevenlabs/client';

let conversation = null;
let selectedAudioDevice = null;
let selectedSpeakerDevice = null;

async function getAvailableAudioDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return {
    inputs: devices.filter(device => device.kind === "audioinput"),
    outputs: devices.filter(device => device.kind === "audiooutput"),
  };
}

async function populateDeviceSelectors() {
  try {
    // We need to request permission first to get the device labels
    await navigator.mediaDevices.getUserMedia({ audio: true });

    const devices = await getAvailableAudioDevices();
    const micSelector = document.getElementById("audioDeviceSelector");
    const speakerSelector = document.getElementById("speakerDeviceSelector");

    // Clear existing options
    micSelector.innerHTML = "";
    speakerSelector.innerHTML = "";

    // Add default options
    const defaultMicOption = document.createElement("option");
    defaultMicOption.value = "";
    defaultMicOption.textContent = "Default Microphone";
    micSelector.appendChild(defaultMicOption);

    const defaultSpeakerOption = document.createElement("option");
    defaultSpeakerOption.value = "";
    defaultSpeakerOption.textContent = "Default Speaker";
    speakerSelector.appendChild(defaultSpeakerOption);

    // Add all available audio input devices
    devices.inputs.forEach(device => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.textContent =
        device.label || `Microphone (${device.deviceId.slice(0, 5)}...)`;
      micSelector.appendChild(option);
    });

    // Add all available audio output devices
    devices.outputs.forEach(device => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.textContent =
        device.label || `Speaker (${device.deviceId.slice(0, 5)}...)`;
      speakerSelector.appendChild(option);
    });

    // Show the device selectors
    document.getElementById("deviceSelectorContainer").style.display = "block";
  } catch (error) {
    console.error("Error populating device selectors:", error);
  }
}

// Update to use the selected microphone
async function requestMicrophonePermission() {
  try {
    const constraints = {
      audio: selectedAudioDevice
        ? { deviceId: { exact: selectedAudioDevice } }
        : true,
    };

    console.log("Requesting microphone with constraints:", constraints);

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Check which device is actually being used
    const tracks = stream.getAudioTracks();
    if (tracks.length > 0) {
      const settings = tracks[0].getSettings();
      console.log("Actual microphone in use:", settings.deviceId);
      console.log("Microphone settings:", settings);

      // Compare with our selected device
      if (selectedAudioDevice) {
        console.log(
          "Is selected device being used?",
          settings.deviceId === selectedAudioDevice ? "YES" : "NO"
        );
      }
    }

    // Update the status to show which microphone is active
    updateDeviceStatus();

    return true;
  } catch (error) {
    console.error("Microphone permission denied:", error);
    return false;
  }
}

// Function to set the audio output device
async function setSpeakerDevice(audioElement) {
  if (!selectedSpeakerDevice || !audioElement.setSinkId) {
    return; // Use default or setSinkId not supported
  }

  try {
    await audioElement.setSinkId(selectedSpeakerDevice);
    console.log("Output device set to:", selectedSpeakerDevice);

    // Update the status to show which speaker is active
    updateDeviceStatus();
  } catch (error) {
    console.error("Error setting audio output device:", error);
  }
}

// Function to update the active device status display
function updateDeviceStatus() {
  const micStatusElement = document.getElementById("microphoneStatus");
  const speakerStatusElement = document.getElementById("speakerStatus");

  // Get the selected option text to display the device name
  const micSelector = document.getElementById("audioDeviceSelector");
  const speakerSelector = document.getElementById("speakerDeviceSelector");

  const micName =
    micSelector.options[micSelector.selectedIndex]?.textContent ||
    "Default Microphone";
  const speakerName =
    speakerSelector.options[speakerSelector.selectedIndex]?.textContent ||
    "Default Speaker";

  micStatusElement.textContent = `Active Microphone: ${micName}`;
  speakerStatusElement.textContent = `Active Speaker: ${speakerName}`;

  // Make the status visible
  document.getElementById("deviceStatusContainer").style.display = "block";
}

async function getSignedUrl() {
  try {
    const response = await fetch("/api/signed-url");
    if (!response.ok) throw new Error("Failed to get signed URL");
    const data = await response.json();
    return data.signedUrl;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    throw error;
  }
}

async function getAgentId() {
  const response = await fetch("/api/getAgentId");
  const { agentId } = await response.json();
  return agentId;
}

function updateStatus(isConnected) {
  const statusElement = document.getElementById("connectionStatus");
  statusElement.textContent = isConnected ? "Connected" : "Disconnected";
  statusElement.classList.toggle("connected", isConnected);
}

function updateSpeakingStatus(mode) {
  const statusElement = document.getElementById("speakingStatus");
  // Update based on the exact mode string we receive
  const isSpeaking = mode.mode === "speaking";
  statusElement.textContent = isSpeaking ? "Agent Speaking" : "Agent Silent";
  statusElement.classList.toggle("speaking", isSpeaking);
  console.log("Speaking status updated:", { mode, isSpeaking }); // Debug log
}

async function startConversation() {
  const startButton = document.getElementById("startButton");
  const endButton = document.getElementById("endButton");

  try {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      alert("Microphone permission is required for the conversation.");
      return;
    }

    const signedUrl = await getSignedUrl();
    //const agentId = await getAgentId(); // You can switch to agentID for public agents

    console.log(
      "Starting conversation with microphone device ID:",
      selectedAudioDevice || "default"
    );

    conversation = await Conversation.startSession({
      signedUrl: signedUrl,
      //agentId: agentId, // You can switch to agentID for public agents
      onConnect: () => {
        updateStatus(true);
        startButton.disabled = true;
        endButton.disabled = false;

        // Disable device selectors when connected
        document.getElementById("audioDeviceSelector").disabled = true;
        document.getElementById("speakerDeviceSelector").disabled = true;

        // Log the active audio devices to verify selection
        console.log("Connection established with devices:", {
          microphone: selectedAudioDevice || "default",
          speaker: selectedSpeakerDevice || "default",
        });
      },
      onDisconnect: () => {
        console.log("Disconnected");
        updateStatus(false);
        startButton.disabled = false;
        endButton.disabled = true;
        updateSpeakingStatus({ mode: "listening" }); // Reset to listening mode on disconnect

        // Re-enable device selectors when disconnected
        document.getElementById("audioDeviceSelector").disabled = false;
        document.getElementById("speakerDeviceSelector").disabled = false;
      },
      onError: error => {
        console.error("Conversation error:", error);
        alert("An error occurred during the conversation.");
      },
      onModeChange: mode => {
        console.log("Mode changed:", mode); // Debug log to see exact mode object
        updateSpeakingStatus(mode);
      },
      deviceId: selectedAudioDevice || undefined,
      outputDeviceId: selectedSpeakerDevice || undefined,
    });

    // Log the conversation object to inspect available properties
    console.log("Conversation object:", conversation);
  } catch (error) {
    console.error("Error starting conversation:", error);
    alert("Failed to start conversation. Please try again.");
  }
}

async function endConversation() {
  if (conversation) {
    await conversation.endSession();
    conversation = null;
  }
}

// Add event listener for device selection
document.addEventListener("DOMContentLoaded", () => {
  // Initial setup - populate device lists when the page loads
  populateDeviceSelectors();

  // Add device selection listeners
  document
    .getElementById("audioDeviceSelector")
    .addEventListener("change", event => {
      selectedAudioDevice = event.target.value;
      console.log("Selected microphone:", selectedAudioDevice);
      // Update the microphone status display
      updateDeviceStatus();
    });

  document
    .getElementById("speakerDeviceSelector")
    .addEventListener("change", event => {
      selectedSpeakerDevice = event.target.value;
      console.log("Selected speaker:", selectedSpeakerDevice);
      // Update the speaker status display
      updateDeviceStatus();
    });

  document
    .getElementById("startButton")
    .addEventListener("click", startConversation);
  document
    .getElementById("endButton")
    .addEventListener("click", endConversation);

  // Initialize device status display
  updateDeviceStatus();
});

window.addEventListener("error", function (event) {
  console.error("Global error:", event.error);
});
