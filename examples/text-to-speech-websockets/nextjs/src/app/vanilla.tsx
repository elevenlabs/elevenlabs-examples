import { AudioContextPlayer } from '~/lib/audio-context-player';

const socket = new WebSocket('ws://localhost:5000/realtime-audio');
const player = new AudioContextPlayer();

socket.onmessage = async (message) => {
  player.playChunk({ buffer: message.data });
};

socket.onopen = () => {
  socket.send('Hello from the client!');
};
