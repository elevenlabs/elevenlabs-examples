'use client';
import { useEffect, useState } from 'react';
import { Button, Input } from '~/components/ui';
import { AudioContextPlayer } from '~/lib/audio-context-player';
import { io, type Socket } from 'socket.io-client';

const url = 'ws://localhost:5000';

let socket: Socket;

let hasMounted = false;

export default function Page() {
  const [text, setText] = useState('');

  useEffect(() => {
    // ensures only connects once during development
    if (hasMounted) return;

    hasMounted = true;
    socket = io(url);

    const stream = new AudioContextPlayer();

    socket.on('audio', (message) => {
      stream.playChunk({ buffer: message });
    });

    socket.on('error', (error) => {
      // reconnect on error
      socket.disconnect();
      socket.connect();
    });

    return () => {};
  }, []);

  const send = (text: string) => {
    if (!text) return;

    socket.send(
      JSON.stringify({
        text,
        isFinal: true,
      })
    );
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
