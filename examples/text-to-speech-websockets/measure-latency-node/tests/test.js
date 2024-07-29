const { measureLatencies } = require('../dist/index');

jest.setTimeout(30000);

describe('measureLatencies', () => {
  it('should measure latencies and return average times', async () => {
    const config = {
      apiKey: process.env.ELEVENLABS_API_KEY,
      model: 'eleven_turbo_v2',
      voiceId: '21m00Tcm4TlvDq8ikWAM',
    };

    const results = await measureLatencies(config);

    expect(results.length > 1).toBeTruthy();
  });
});
