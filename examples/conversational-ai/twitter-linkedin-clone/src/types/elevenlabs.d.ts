declare namespace JSX {
  interface IntrinsicElements {
    "elevenlabs-convai": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        "agent-id"?: string;
        "signed-url"?: string;
        "server-location"?: string;
        variant?: string;
        "avatar-image-url"?: string;
        "avatar-orb-color-1"?: string;
        "avatar-orb-color-2"?: string;
        "action-text"?: string;
        "start-call-text"?: string;
        "end-call-text"?: string;
        "expand-text"?: string;
        "listening-text"?: string;
        "speaking-text"?: string;
        "dynamic-variables"?: string;
        "override-language"?: string;
        "override-prompt"?: string;
        "override-first-message"?: string;
        "override-voice-id"?: string;
      },
      HTMLElement
    >;
  }
}
