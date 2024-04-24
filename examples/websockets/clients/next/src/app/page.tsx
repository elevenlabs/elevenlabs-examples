'use client';
import { useEffect, useState } from 'react';
import { Button, Input } from '~/components/ui';
import { AudioContextPlayer } from '~/lib/audio-context-player';

const url = 'ws://localhost:5000/realtime-audio';
let socket: WebSocket;

export default function Page() {
  const [text, setText] = useState('');

  useEffect(() => {
    socket = new WebSocket(url);
    const stream = new AudioContextPlayer();

    socket.onopen = () => {};

    socket.onmessage = async (message) => {
      stream.playChunk({ buffer: message.data });
    };

    return () => {
      socket.close();
    };
  }, [url]);

  const send = (text: string) => {
    if (!text) return;

    socket.send(text);
  };

  return (
    <main className="p-24 max-w-3xl mx-auto">
      <form
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();

          send(text);
          setText('');
        }}
      >
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoFocus
        />

        <Button type="submit" className="w-full">
          Send
        </Button>
      </form>
    </main>
  );
}
