export type VideoToSFXRequestBody = {
  frames: string[]; // base64 encoded images
  maxDuration?: number; // maximum of 11
};

export type VideoToSFXResponseBody = {
  soundEffects: string[]; // base64 encoded sound effects
  caption: string; // captions for frame
};
