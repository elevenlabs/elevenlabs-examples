import EventEmitter from 'events';
import OpenAI from 'openai';

export class Llm extends EventEmitter {
  private openai: OpenAI;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private userContext: any[];
  private partialResponseIndex: number;

  constructor() {
    super();
    this.openai = new OpenAI();
    this.userContext = [
      {
        role: 'system',
        content:
          'You are a helpful assistant called Eleven. You help with anything related to ElevenLabs. ElevenLabs is an AI research company that develops audio AI models. Keep your responses short and to the point. This is a conversation you are having with a person, so keep it natural and casual.',
      },
      {
        role: 'assistant',
        content: 'Hi, my name is Eleven. How can I help you?',
      },
    ];
    this.partialResponseIndex = 0;
  }

  // Add the callSid to the chat context in case
  // LLM decides to transfer the call.
  setCallSid(callSid: string) {
    this.userContext.push({ role: 'system', content: `callSid: ${callSid}` });
  }

  updateUserContext(name: string, role: string, text: string) {
    if (name !== 'user') {
      this.userContext.push({ role: role, name: name, content: text });
    } else {
      this.userContext.push({ role: role, content: text });
    }
  }

  async completion(text: string, role = 'user', name = 'user') {
    this.updateUserContext(name, role, text);

    // Step 1: Send user transcription to LLM
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125',
      messages: this.userContext,
      stream: true,
    });

    let completeResponse = '';
    let partialResponse = '';
    let finishReason = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';

      finishReason = chunk.choices[0]?.finish_reason ?? '';

      // We use completeResponse for userContext
      completeResponse += content;
      // We use partialResponse to provide a chunk for TTS
      partialResponse += content;
      // Emit last partial response and add complete response to userContext
      if (content.trim().slice(-1) === '•' || finishReason === 'stop') {
        const llmReply = {
          partialResponseIndex: this.partialResponseIndex,
          partialResponse,
        };

        this.emit('llmreply', llmReply);
        this.partialResponseIndex++;
        partialResponse = '';
      }
    }
    this.userContext.push({ role: 'assistant', content: completeResponse });
    console.log(`LLM -> user context length: ${this.userContext.length}`.green);
  }
}
