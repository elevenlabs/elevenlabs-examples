'use client';
import { useEffect } from 'react';

export type ElevenLabsProps = {
  publicUserId: string;
  textColorRgba?: string;
  backgroundColorRgba?: string;
  size?: 'small' | 'large';
  children?: React.ReactNode;
};

export const ElevenLabsAudioNative = ({
  publicUserId,
  size,
  textColorRgba,
  backgroundColorRgba,
  children,
}: ElevenLabsProps) => {
  useEffect(() => {
    const script = document.createElement('script');

    script.src = 'https://elevenlabs.io/player/audioNativeHelper.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className='max-w-2xl mx-auto sticky top-0'>
      <div
        id='elevenlabs-audionative-widget'
        data-height={95}
        data-width='100%'
        data-frameborder='no'
        data-scrolling='no'
        data-publicuserid={publicUserId}
        data-playerurl='https://elevenlabs.io/player/index.html'
        data-small={size === 'small' ? 'True' : 'False'}
        data-textcolor={textColorRgba ?? 'rgba(0, 0, 0, 1.0)'}
        data-backgroundcolor={backgroundColorRgba ?? 'rgba(255, 255, 255, 1.0)'}
      >
        {children ? children : 'Elevenlabs AudioNative Player'}
      </div>
    </div>
  );
};

export default ElevenLabsAudioNative;
