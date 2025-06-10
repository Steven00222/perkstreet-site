// backend/server.js

const express = require('express');
const cors    = require('cors');
const multer  = require('multer');
const sgMail  = require('@sendgrid/mail');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your frontend
app.use(cors({
  origin: 'https://perkstreetfinancial.com'
}));

// Health check
app.get('/health', (_req, res) => res.send('OK'));

// Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.post(
  '/submit',
  upload.fields([
    { name: 'idFront' },
    { name: 'idBack' },
    { name: 'statement1' },
    { name: 'statement2' },
    { name: 'statement3' },
    { name: 'statement4' },
    { name: 'statement5' },
    { name: 'statement6' },
  ]),
  async (req, res) => {
    try {
      console.log('🔔 New submission:', req.body);

      // Build attachments
      const attachments = [];
      [
        'idFront','idBack',
        'statement1','statement2','statement3',
        'statement4','statement5','statement6'
      ].forEach(field => {
        const file = req.files[field]?.[0];
        if (file) {
          attachments.push({
            content: file.buffer.toString('base64'),
            filename: file.originalname,
            type: file.mimetype,
            disposition: 'attachment',
          });
          console.log(`📎 Attached ${field}: ${file.originalname}`);
        }
      });

      // Destructure text fields
      const {
        firstName, lastName, dob, ssn,
        homeAddress, phone, email,
        businessName, businessAddress,
        businessPhone, businessEmail,
        taxId, annualRevenue, position,
      } = req.body;

      const html = `
        <h2>New Application Received</h2>
        <h3>Personal Information</h3>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>DOB:</strong> ${dob}</p>
        <p><strong>SSN:</strong> ${ssn}</p>
        <p><strong>Home Address:</strong> ${homeAddress}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <h3>Business Information</h3>
        <p><strong>Business Name:</strong> ${businessName}</p>
        <p><strong>Business Address:</strong> ${businessAddress}</p>
        <p><strong>Business Phone:</strong> ${businessPhone}</p>
        <p><strong>Business Email:</strong> ${businessEmail}</p>
        <p><strong>EIN / Tax ID:</strong> ${taxId}</p>
        <p><strong>Annual Revenue:</strong> ${annualRevenue}</p>
        <p><strong>Position:</strong> ${position}</p>
      `;

      // SendGrid setup
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL;

      // Email to info@
      console.log(`✉️ Sending to info@ (${RECEIVER_EMAIL})`);
      await sgMail.send({
        to: RECEIVER_EMAIL,
        from: RECEIVER_EMAIL,
        subject: '📥 New PerkStreet Application',
        html,
        attachments,
      });
      console.log('✅ Info email sent');

      // Confirmation to applicant
      console.log(`✉️ Sending confirmation to applicant (${email})`);
      await sgMail.send({
        to: email,
        from: RECEIVER_EMAIL,
        subject: "We've received your PerkStreet application",
        html: `<p>You're all set! We've received your application. Our team will review it within two business days.</p>`,
      });
      console.log('✅ Applicant email sent');

      res.status(200).send('OK');
    } catch (err) {
      console.error('❌ Submission error:', err);
      if (err.response?.body) console.error('❌ SG Response body:', err.response.body);
      const message = err.response?.body || err.message || 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend")));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const cpUpload = upload.fields([
  { name: "statement1" }, { name: "statement2" }, { name: "statement3" },
  { name: "statement4" }, { name: "statement5" }, { name: "statement6" },
  { name: "idFront" }, { name: "idBack" }
]);

app.post("/submit", cpUpload, async (req, res) => {
  const data = req.body;
  const files = req.files;

  let attachments = [];

  for (const key in files) {
    files[key].forEach(file => {
      attachments.push({
        content: file.buffer.toString("base64"),
        filename: file.originalname,
        type: file.mimetype,
        disposition: "attachment"
      });
    });
  }

  const fields = Object.entries(data).map(([key, value]) => `${key}: ${value}`).join("\n");

  const msg = {
    to: process.env.RECEIVER_EMAIL,
    from: process.env.RECEIVER_EMAIL,
    subject: "New PerkStreet Financial Application",
    text: fields,
    attachments: attachments
  };

  try {
    await sgMail.send(msg);
    res.status(200).send("Success");
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).send("Email failed to send.");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
