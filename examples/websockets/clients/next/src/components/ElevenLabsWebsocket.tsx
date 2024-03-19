'use client';
import { useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { ElevenStreamingWeb } from '~/stream';
import { Button, Input } from '~/components/ui';

export const ElevenLabsWebsocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [text, setText] = useState('');

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL ?? '');
    const stream = new ElevenStreamingWeb();

    socket.on('message', (audio) => {
      stream.playChunk({ buffer: audio });
    });

    setSocket(socket);

    return () => {
      socket.close();
    };
  }, []);

  if (!socket) return;

  return (
    <div>
      <form
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();

          if (!text) return;

          socket.emit('init', text);
          setText('');
        }}
      >
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          autoFocus
        />

        <Button type="submit" className="w-full">
          Start
        </Button>
      </form>
    </div>
  );
};
