require('dotenv').config();

// You can use this function to make a
// test call to your application by running
// npm inbound
async function makeInboundCall() {
  const VoiceResponse = require('twilio').twiml.VoiceResponse;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  const client = require('twilio')(accountSid, authToken);
  
  let twiml = new VoiceResponse();
  twiml.pause({ length: 10 });
  twiml.say('Which models of airpods do you have available right now?');
  twiml.pause({ length: 30 });
  twiml.hangup();

  console.log(twiml.toString());
  
  await client.calls
    .create({
      twiml: twiml.toString(),
      to: process.env.APP_NUMBER,
      from: process.env.FROM_NUMBER
    })
    .then(call => console.log(call.sid));
}  

makeInboundCall();