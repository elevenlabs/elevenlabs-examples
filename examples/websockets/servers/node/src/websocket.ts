import WebSocket from 'ws';

export const websocket = (text: string, onMessage: (audio: Buffer) => void) => {
  const voiceId = 'Rn9Yq7uum9irZ6RwppDN';
  const model = 'eleven_multilingual_v1';
  const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}&output_format=pcm_44100`;
  const socket = new WebSocket(wsUrl);

  socket.onopen = (event) => {
    const bosMessage = {
      text: ' ',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
      },
      xi_api_key: process.env.ELEVENLABS_API_KEY,
    };

    socket.send(JSON.stringify(bosMessage));

    const textMessage = {
      text: `${text} `,
      try_trigger_generation: true,
    };

    socket.send(JSON.stringify(textMessage));

    const eosMessage = {
      text: '',
    };

    socket.send(JSON.stringify(eosMessage));
  };

  socket.onmessage = (event: any) => {
    const response = JSON.parse(event.data);

    if (response.audio) {
      onMessage(response.audio);

      console.log('Received audio chunk');
    } else {
      console.log('No audio data in the response');
    }

    if (response.isFinal) {
    }

    if (response.normalizedAlignment) {
    }
  };

  socket.onerror = (error) => {
    console.error(`WebSocket Error: ${error}`);
  };

  socket.onclose = (event) => {
    if (event.wasClean) {
      console.info(
        `Connection closed cleanly, code=${event.code}, reason=${event.reason}`,
      );
    } else {
      console.warn('Connection died');
    }
  };
};
