const { sendEmail } = require('../services/emailServices.js'); 
const Otp = require('../models/OTP.js');  
const {sendSms} = require('../services/smsServices.js'); 

const OTP_VALIDITY_PERIOD = 5 * 60 * 1000; // 5 minutes

const sendOtp = async (req, res) => {
    const { email, phone, otpMethod } = req.body;
    console.log("email",email);
    

    if (!email && !phone) {
        return res.status(400).json({ success: false, message: 'Email or phone number is required' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = new Date(Date.now() + OTP_VALIDITY_PERIOD); // 5 minutes

    try {
        const existingOtp = await Otp.findOne({ email });

        if (existingOtp) {
           {
                existingOtp.otp = otp; // New OTP
                existingOtp.expiresAt = expirationTime;
                await existingOtp.save();
            }
        } else {
            // Create new OTP entry
            const newOtp = new Otp({
                otp,
                email: email || null,
                phone: phone || null,
                expiresAt: expirationTime,
            });
            await newOtp.save();
        }

        // Send OTP via specified method
        if (otpMethod === 'email' && email) {
            await sendEmail(otp, email);
            return res.status(200).json({ success: true, message: 'OTP sent to email' });
        }
        if (otpMethod === 'phone' && phone) {
            await sendSms(otp, phone);
            return res.status(200).json({ success: true, message: 'OTP sent via SMS' });
        }

        return res.status(400).json({ success: false, message: 'No valid method for sending OTP' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ success: false, message: 'Failed to send OTP', error });
    }
};
// Worker OTP//
const sendOtpWorker = async (req, res) => {
    console.log('Send OTP function called'); 
    const { email, otpMethod } = req.body; 
    console.log("req", req.body);
    console.log("email", email);
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = new Date(Date.now() + 5 * 60 * 1000); 
    console.log(`OTP for ${email}: ${otp}`);

    try {
        
        const existingOtp = await Otp.findOne({ email });

        if (existingOtp) {
            existingOtp.otp = otp;
            existingOtp.expiresAt = expirationTime;
            await existingOtp.save();
            console.log('OTP updated in database'); 
        } else {
            
            const newOtp = new Otp({
                otp,
                email, 
                expiresAt: expirationTime,
            });
            await newOtp.save();
            console.log('OTP saved to database'); 
        }

        if (otpMethod === 'email' && email) {
            try {
                await sendEmail(otp, email); 
                return res.status(200).json({ success: true, message: 'OTP sent to email' });
            } catch (error) {
                console.error('Error sending email:', error); 
                return res.status(500).json({ success: false, message: 'Failed to send OTP via email', error });
            }
        }

        return res.status(400).json({ success: false, message: 'No valid method for sending OTP' });
    } catch (error) {
        console.error('Error saving OTP:', error);
        return res.status(500).json({ success: false, message: 'Failed to send OTP', error });
    }
};


module.exports = { sendOtp,sendOtpWorker };;
