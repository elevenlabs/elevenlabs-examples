require('colors');
const { Deepgram } = require('@deepgram/sdk');
const { Buffer } = require('node:buffer');
const EventEmitter = require('events');


class TranscriptionService extends EventEmitter {
  constructor() {
    super();
    const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);
    this.deepgramLive = deepgram.transcription.live({
      encoding: 'mulaw',
      sample_rate: '8000',
      model: 'nova-2',
      punctuate: true,
      interim_results: true,
      endpointing: 200,
      utterance_end_ms: 1000
    });

    this.finalResult = '';
    this.speechFinal = false; // used to determine if we have seen speech_final=true indicating that deepgram detected a natural pause in the speakers speech. 

    this.deepgramLive.addListener('transcriptReceived', (transcriptionMessage) => {
      const transcription = JSON.parse(transcriptionMessage);
      const alternatives = transcription.channel?.alternatives;
      let text = '';
      if (alternatives) {
        text = alternatives[0]?.transcript;
      }
      
      // if we receive an UtteranceEnd and speech_final has not already happened then we should consider this the end of of the human speech and emit the transcription
      if (transcription.type === 'UtteranceEnd') {
        if (!this.speechFinal) {
          console.log(`UtteranceEnd received before speechFinal, emit the text collected so far: ${this.finalResult}`.yellow);
          this.emit('transcription', this.finalResult);
          return;
        } else {
          console.log('STT -> Speech was already final when UtteranceEnd recevied'.yellow);
          return;
        }
      }

      // console.log(text, "is_final: ", transcription?.is_final, "speech_final: ", transcription.speech_final);
      // if is_final that means that this chunk of the transcription is accurate and we need to add it to the finalResult 
      if (transcription.is_final === true && text.trim().length > 0) {
        this.finalResult += ` ${text}`;
        // if speech_final and is_final that means this text is accurate and it's a natural pause in the speakers speech. We need to send this to the assistant for processing
        if (transcription.speech_final === true) {
          this.speechFinal = true; // this will prevent a utterance end which shows up after speechFinal from sending another response
          this.emit('transcription', this.finalResult);
          this.finalResult = '';
        } else {
          // if we receive a message without speechFinal reset speechFinal to false, this will allow any subsequent utteranceEnd messages to properly indicate the end of a message
          this.speechFinal = false;
        }
      } else {
        this.emit('utterance', text);
      }
    });

    this.deepgramLive.addListener('error', (error) => {
      console.error('STT -> deepgram error');
      console.error(error);
    });

    this.deepgramLive.addListener('warning', (warning) => {
      console.error('STT -> deepgram warning');
      console.error(warning);
    });

    this.deepgramLive.addListener('metadata', (metadata) => {
      console.error('STT -> deepgram metadata');
      console.error(metadata);
    });
    
    this.deepgramLive.addListener('close', () => {
      console.log('STT -> Deepgram connection closed'.yellow);
    });
  }

  /**
   * Send the payload to Deepgram
   * @param {String} payload A base64 MULAW/8000 audio stream
   */
  send(payload) {
    // TODO: Buffer up the media and then send
    if (this.deepgramLive.getReadyState() === 1) {
      this.deepgramLive.send(Buffer.from(payload, 'base64'));
    }
  }
}

module.exports = { TranscriptionService };