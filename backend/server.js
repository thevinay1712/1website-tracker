require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Set up the email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Create the endpoint to receive alerts
app.post('/send-alert', async (req, res) => {
  console.log('Received alert data from extension.');
  const { websiteName, url, trackedSection, checkInterval, timestamp, oldContent, newContent, userEmail } = req.body;

  // Define the email content and structure
  const mailOptions = {
    from: `"Website Tracker" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🔔 Update Detected on ${websiteName}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <p>Hello,</p>
        <p>A change has been detected in one of your tracked website sections.</p>
        <hr>
        <p><strong>Website:</strong> ${websiteName}</p>
        <p><strong>URL:</strong> <a href="${url}">${url}</a></p>
        <p><strong>Tracked Section:</strong> <code>${trackedSection}</code></p>
        <p><strong>Check Interval:</strong> Every ${checkInterval}</p>
        <p><strong>Change Detected On:</strong> ${timestamp}</p>
        <hr>
        <h3>--- Old Content ---</h3>
        <div style="background-color:#ffecec; padding:10px; border-radius:5px; border:1px solid #ffcccc;">${oldContent}</div>
        <hr>
        <h3>--- New Content ---</h3>
        <div style="background-color:#e6ffec; padding:10px; border-radius:5px; border:1px solid #ccffcc;">${newContent}</div>
        <hr>
        <p>Best Regards,<br>Website Tracker Extension</p>
      </div>
    `,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email alert sent successfully to', userEmail);
    res.status(200).send({ message: 'Email alert sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ message: 'Failed to send email.' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`💻 Server is listening for requests at http://localhost:${PORT}`);
});