const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    cb(null, `${timestamp}_${file.originalname}`);
  }
});
const upload = multer({ storage: storage }).fields([
  { name: 'statement1' }, { name: 'statement2' }, { name: 'statement3' },
  { name: 'statement4' }, { name: 'statement5' }, { name: 'statement6' },
  { name: 'idFront' }, { name: 'idBack' }
]);

app.post('/submit', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('❌ File upload error:', err);
      return res.status(500).send('<h3>There was a problem processing your application. Please try again later or contact support.</h3>');
    }

    try {
      const data = req.body;

      const fields = [
        'fullName', 'email', 'phone', 'ssn', 'dob', 'homeAddress',
        'businessName', 'businessAddress', 'businessPhone', 'businessEmail',
        'businessWebsite', 'ein', 'annualRevenue', 'position'
      ];

      const info = fields.map(field => `${field}: ${data[field] || 'N/A'}`).join('\n');

      const attachments = [];
      if (req.files) {
        Object.keys(req.files).forEach(key => {
          const file = req.files[key][0];
          const content = fs.readFileSync(file.path).toString('base64');
          attachments.push({
            content,
            filename: file.originalname,
            type: file.mimetype,
            disposition: "attachment"
          });
        });
      }

      const msg = {
        to: process.env.RECEIVER_EMAIL,
        from: process.env.RECEIVER_EMAIL,
        subject: "New PerkStreet Financial Application",
        text: info,
        attachments
      };

      await sgMail.send(msg);

      const confirmationMsg = {
        to: data.email,
        from: process.env.RECEIVER_EMAIL,
        subject: "Your Application Was Received",
        text: `You're all set! We've received your application. Our team will review it and get back to you within two business days.`,
        html: `<h2 style="font-family: Inter, sans-serif;">You're all set!<br>We've received the application. Our team will review the information and get back to you within two business days. Keep an eye on your inbox.</h2>`
      };

      await sgMail.send(confirmationMsg);

      res.send(`<h2 style="font-family: Inter, sans-serif;">You're all set!<br>We've received the application. Our team will review the information and get back to you within two business days. Keep an eye on your inbox.</h2>`);

    } catch (error) {
      console.error('❌ Error submitting form:', error);
      res.status(500).send('<h3>There was a problem processing your application. Please try again later or contact support.</h3>');
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});