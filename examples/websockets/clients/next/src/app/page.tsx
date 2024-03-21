'use client';
import { useState } from 'react';
import { Button, Input } from '~/components/ui';
import { useRealtimeAudio } from '@elevenlabs-alpha/react';

const url = process.env.NEXT_PUBLIC_SERVER_WS_URL ?? '';

export default function Page() {
  const { send } = useRealtimeAudio({ url });
  const [text, setText] = useState('');

  return (
    <main className="p-24 max-w-3xl mx-auto">
      <form
        className="grid gap-6"
        onSubmit={(event) => {
          event.preventDefault();

          if (!text) return;

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
