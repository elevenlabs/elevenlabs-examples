// --- src/app.js ---
import { Conversation } from '@elevenlabs/client';

let conversation = null;
const startButton = document.getElementById('startButton');
const endButton = document.getElementById('endButton');
const inputDeviceSelect = document.getElementById('inputDeviceSelect');
const outputDeviceSelect = document.getElementById('outputDeviceSelect');
const outputSupportNotice = document.getElementById('outputSupportNotice');

function supportsSetSinkId() {
    return typeof HTMLAudioElement !== 'undefined' && 'setSinkId' in HTMLAudioElement.prototype;
}

function getAudioConstraintForInputDevice(inputDeviceId) {
    if (!inputDeviceId) {
        return true;
    }

    return {
        deviceId: { exact: inputDeviceId }
    };
}

function stopStreamTracks(stream) {
    if (!stream) {
        return;
    }

    stream.getTracks().forEach((track) => track.stop());
}

async function requestMicrophonePermission(inputDeviceId, options = { silent: false }) {
    let stream;

    try {
        stream = await navigator.mediaDevices.getUserMedia({
            audio: getAudioConstraintForInputDevice(inputDeviceId)
        });

        return true;
    } catch (error) {
        if (!options.silent) {
            console.error('Microphone permission denied:', error);
        }

        return false;
    } finally {
        stopStreamTracks(stream);
    }
}

function getDeviceLabel(device, index, fallbackPrefix) {
    if (device.label) {
        return device.label;
    }

    return `${fallbackPrefix} ${index + 1}`;
}

function populateDeviceSelect(selectElement, devices, config) {
    const { defaultLabel, selectedValue } = config;
    selectElement.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = defaultLabel;
    selectElement.appendChild(defaultOption);

    devices.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.textContent = getDeviceLabel(
            device,
            index,
            device.kind === 'audioinput' ? 'Microphone' : 'Speaker'
        );
        selectElement.appendChild(option);
    });

    selectElement.value = selectedValue && devices.some((device) => device.deviceId === selectedValue)
        ? selectedValue
        : '';
}

async function refreshAudioDeviceSelectors() {
    if (!navigator.mediaDevices?.enumerateDevices || !inputDeviceSelect || !outputDeviceSelect) {
        return;
    }

    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputDevices = devices.filter((device) => device.kind === 'audioinput');
        const outputDevices = devices.filter((device) => device.kind === 'audiooutput');

        const selectedInputId = inputDeviceSelect.value;
        const selectedOutputId = outputDeviceSelect.value;

        populateDeviceSelect(inputDeviceSelect, inputDevices, {
            defaultLabel: 'Default microphone',
            selectedValue: selectedInputId
        });

        populateDeviceSelect(outputDeviceSelect, outputDevices, {
            defaultLabel: 'Default speaker',
            selectedValue: selectedOutputId
        });

        if (!supportsSetSinkId()) {
            outputDeviceSelect.value = '';
            outputDeviceSelect.disabled = true;
            if (outputSupportNotice) {
                outputSupportNotice.textContent = 'Speaker selection is not supported in this browser. Default output will be used.';
            }
            return;
        }

        outputDeviceSelect.disabled = false;
        if (outputSupportNotice) {
            outputSupportNotice.textContent = '';
        }
    } catch (error) {
        console.error('Failed to enumerate audio devices:', error);
    }
}

function getSelectedInputDeviceId() {
    if (!inputDeviceSelect) {
        return undefined;
    }

    return inputDeviceSelect.value || undefined;
}

function getSelectedOutputDeviceId() {
    if (!outputDeviceSelect || !supportsSetSinkId()) {
        return undefined;
    }

    return outputDeviceSelect.value || undefined;
}

async function initializeAudioDeviceSelection() {
    const hasPermission = await requestMicrophonePermission(undefined, { silent: true });
    if (!hasPermission) {
        console.warn('Microphone permission was not granted during initialization. Device labels may be hidden.');
    }

    await refreshAudioDeviceSelectors();

    if (navigator.mediaDevices?.addEventListener) {
        navigator.mediaDevices.addEventListener('devicechange', refreshAudioDeviceSelectors);
    }
}

async function getSignedUrl() {
    try {
        const response = await fetch('/api/signed-url');
        if (!response.ok) throw new Error('Failed to get signed URL');
        const data = await response.json();
        return data.signedUrl;
    } catch (error) {
        console.error('Error getting signed URL:', error);
        throw error;
    }
}

async function getAgentId() {
    const response = await fetch('/api/getAgentId');
    const { agentId } = await response.json();
    return agentId;
}

function updateStatus(isConnected) {
    const statusElement = document.getElementById('connectionStatus');
    statusElement.textContent = isConnected ? 'Connected' : 'Disconnected';
    statusElement.classList.toggle('connected', isConnected);
}

function updateSpeakingStatus(mode) {
    const statusElement = document.getElementById('speakingStatus');
    // Update based on the exact mode string we receive
    const isSpeaking = mode.mode === 'speaking';
    statusElement.textContent = isSpeaking ? 'Agent Speaking' : 'Agent Silent';
    statusElement.classList.toggle('speaking', isSpeaking);
    console.log('Speaking status updated:', { mode, isSpeaking }); // Debug log
}

async function startConversation() {
    const selectedInputDeviceId = getSelectedInputDeviceId();
    const selectedOutputDeviceId = getSelectedOutputDeviceId();

    try {
        const hasPermission = await requestMicrophonePermission(selectedInputDeviceId);
        if (!hasPermission) {
            alert('Microphone permission is required for the conversation.');
            return;
        }

        const signedUrl = await getSignedUrl();
        //const agentId = await getAgentId(); // You can switch to agentID for public agents
        
        conversation = await Conversation.startSession({
            signedUrl: signedUrl,
            inputDeviceId: selectedInputDeviceId,
            outputDeviceId: selectedOutputDeviceId,
            //agentId: agentId, // You can switch to agentID for public agents
            onConnect: () => {
                console.log('Connected');
                updateStatus(true);
                if (startButton && endButton) {
                    startButton.disabled = true;
                    endButton.disabled = false;
                }
            },
            onDisconnect: () => {
                console.log('Disconnected');
                updateStatus(false);
                if (startButton && endButton) {
                    startButton.disabled = false;
                    endButton.disabled = true;
                }
                updateSpeakingStatus({ mode: 'listening' }); // Reset to listening mode on disconnect
            },
            onError: (error) => {
                console.error('Conversation error:', error);
                alert('An error occurred during the conversation.');
            },
            onModeChange: (mode) => {
                console.log('Mode changed:', mode); // Debug log to see exact mode object
                updateSpeakingStatus(mode);
            }
        });
    } catch (error) {
        console.error('Error starting conversation:', error);
        alert('Failed to start conversation. Please try again.');
    }
}

async function endConversation() {
    if (conversation) {
        await conversation.endSession();
        conversation = null;
    }
}

if (startButton) {
    startButton.addEventListener('click', startConversation);
}

if (endButton) {
    endButton.addEventListener('click', endConversation);
}

initializeAudioDeviceSelection();

window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});
