require('dotenv').config();
const setTimeout = require('timers/promises').setTimeout;
const transferCall = require('../functions/transferCall');

test('Expect transferCall to successfully redirect call', async () => {

  async function makeOutBoundCall() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
        
    const client = require('twilio')(accountSid, authToken);
      
    const sid = await client.calls
      .create({
        url: `https://${process.env.SERVER}/incoming`,
        to: process.env.YOUR_NUMBER,
        from: process.env.FROM_NUMBER
      })
      .then(call => call.sid);
    
    return sid;
  }

  const callSid = await makeOutBoundCall();
  console.log(callSid);
  await setTimeout(10000);
  
  const transferResult = await transferCall(callSid);

  expect(transferResult).toBe('The call was transferred successfully');
}, 20000);