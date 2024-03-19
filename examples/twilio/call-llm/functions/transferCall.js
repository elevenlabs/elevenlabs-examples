require('dotenv').config();

const transferCall = async function (call) {

  console.log('Transferring call', call.callSid);
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);

  return await client.calls(call.callSid)
    .update({twiml: `<Response><Dial>${process.env.TRANSFER_NUMBER}</Dial></Response>`})
    .then(() => {
      return 'The call was transferred successfully, say goodbye to the customer.';
    })
    .catch(() => {
      return 'The call was not transferred successfully, advise customer to call back later.';
    });
};

module.exports = transferCall;