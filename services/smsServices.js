const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = new twilio(accountSid, authToken);
const sendSms = async (otp, phone) => {
    console.log('Sending OTP:', otp, 'to phone:', phone); 
    try {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        await twilioClient.messages.create({
            body: `Your OTP code is ${otp}. It is valid for 5 minutes.`,
            from: twilioPhoneNumber, 
            to: formattedPhone, 
        });
        console.log('OTP SMS sent successfully!');
    } catch (error) {
        console.error('Error sending OTP SMS:', error); 
        if (error.code) {
            console.error('Twilio error code:', error.code); 
        }
        throw new Error('Failed to send OTP SMS');
    }
};

module.exports = { sendSms };
