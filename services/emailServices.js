const nodemailer = require('nodemailer');

const sendEmail = async (otp, email) => {
    console.log('Sending OTP:', otp);
    console.log('Sending to email:', email);
    const transporter = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
            user: process.env.MAIL_ID, 
            pass: process.env.MAIL_PASS, 
        },
    });

    const mailOptions = {
        from: process.env.MAIL_ID, 
        to: email, 
        subject: 'Your OTP Code',
        html: `
        <div style="font-family: Arial, sans-serif; width: 100%; max-width: 600px; margin: auto; border: 1px solid #000; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #4CAF50; color: white; padding: 15px; text-align: center;">
                <h2>OTP Verification</h2>
            </div>
            <div style="padding: 20px; text-align: center;">
                <h3>Your OTP Code</h3>
                <p style="font-size: 36px; font-weight: bold; color: #4CAF50;">${otp}</p>
                <p>Please enter the OTP to verify your identity.</p>
                <p style="color: #555;">This code will expire in 10 minutes.</p>
            </div>
        </div>
    `, 
};

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send OTP email'); 
    }
};

const sendDeletionReasonEmail = async (email, reason) => {
    console.log('Sending deletion reason email to:', email);
    
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.MAIL_ID,
        to: email,
        subject: 'Account Deletion Notification',
        html: `
        <div style="font-family: Arial, sans-serif; width: 100%; max-width: 600px; margin: auto; border: 1px solid #000; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #d9534f; color: white; padding: 15px; text-align: center;">
                <h2>Account Deletion Notification</h2>
            </div>
            <div style="padding: 20px; text-align: center;">
                <h3>Your Account Has Been Deleted</h3>
                <p>We regret to inform you that your account has been deleted for the following reason:</p>
                <p style="font-size: 24px; font-weight: bold; color: #d9534f;">${reason}</p>
                <p>If you believe this was a mistake, please contact support.</p>
                <p style="color: #555;">Thank you for your understanding.</p>
            </div>
        </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Deletion reason email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send deletion reason email');
    }
};

const sendResetPasswordEmail = async (resetLink, email) => {
    console.log("Sending reset password email to:", email);
  
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS,
      },
    });
  
    const mailOptions = {
      from: process.env.MAIL_ID,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; width: 100%; max-width: 600px; margin: auto; border: 1px solid #000; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #007BFF; color: white; padding: 15px; text-align: center;">
            <h2>Password Reset Request</h2>
          </div>
          <div style="padding: 20px; text-align: center;">
            <h3>Reset Your Password</h3>
            <p>We received a request to reset your password. Click the link below to set a new password:</p>
            <a href="${resetLink}" style="background-color: #007BFF; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Reset Password</a>
            <p style="color: #555;">If you did not request this, please ignore this email.</p>
            <p style="color: #555;">This link will expire in 1 hour.</p>
          </div>
        </div>
      `,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log("Reset password email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send reset password email");
    }
  };
  
  const sendBookingNotificationEmail = async (workerEmail, bookingDetails) => {
    console.log("Sending booking notification to:", workerEmail);
  
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS,
      },
    });
  
    const mailOptions = {
      from: process.env.MAIL_ID,
      to: workerEmail,
      subject: "New Booking Alert",
      html: `
        <div style="font-family: Arial, sans-serif; width: 100%; max-width: 600px; margin: auto; border: 1px solid #000; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #007BFF; color: white; padding: 15px; text-align: center;">
            <h2>New Booking Confirmed</h2>
          </div>
          <div style="padding: 20px;">
            <p>Dear Worker,</p>
            <p>You have a new booking request:</p>
            <ul>
              <li><strong>User Name:</strong> ${bookingDetails.name}</li>
              <li><strong>Service:</strong> ${bookingDetails.services}</li>
              <li><strong>Location:</strong> ${bookingDetails.location}</li>
              <li><strong>Date:</strong> ${bookingDetails.date}</li>
              <li><strong>Contact:</strong> ${bookingDetails.phone}</li>
            </ul>
            <p>Please log in to your account for more details.</p>
          </div>
        </div>
      `,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log("Booking notification email sent successfully!");
    } catch (error) {
      console.error("Error sending booking notification email:", error);
      throw new Error("Failed to send booking notification email");
    }
};
const sendLeaveApplicationNotification = async (adminEmail, leaveDetails) => {
  console.log("Sending leave application notification to:", adminEmail);

  const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: process.env.MAIL_ID,
          pass: process.env.MAIL_PASS,
      },
  });

  const mailOptions = {
      from: process.env.MAIL_ID,
      to: adminEmail,
      subject: 'New Leave Application Submitted',
      html: `
      <div style="font-family: Arial, sans-serif; width: 100%; max-width: 600px; margin: auto; border: 1px solid #000; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #007BFF; color: white; padding: 15px; text-align: center;">
              <h2>Leave Application Notification</h2>
          </div>
          <div style="padding: 20px;">
              <p><strong>User Name:</strong> ${leaveDetails.worker}</p>
              <p><strong>Leave Start Date:</strong> ${new Date(leaveDetails.startDate).toLocaleDateString()}</p>
              <p><strong>Leave End Date:</strong> ${new Date(leaveDetails.endDate).toLocaleDateString()}</p>
              <p><strong>Leave Reason:</strong> ${leaveDetails.reason}</p>
          </div>
      </div>
      `,
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log("Leave application notification sent successfully!");
  } catch (error) {
      console.error("Error sending leave application notification:", error);
      throw new Error("Failed to send leave application notification");
  }
};

module.exports = { sendEmail, sendDeletionReasonEmail, sendResetPasswordEmail, sendBookingNotificationEmail, sendLeaveApplicationNotification };


