const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// SendGrid or SMTP transport setup
const transporter = nodemailer.createTransport({
  service: 'SendGrid', // You can use another SMTP if preferred
  auth: {
    user: 'apikey',
    pass: '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'
  }
});

// Accept all files and form fields
const uploadFields = [
  { name: 'bank_statement_jan' },
  { name: 'bank_statement_feb' },
  { name: 'bank_statement_mar' },
  { name: 'bank_statement_apr' },
  { name: 'bank_statement_may' },
  { name: 'bank_statement_jun' },
  { name: 'id_front' },
  { name: 'id_back' }
];

app.post('/submit', upload.fields(uploadFields), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files;

    let text = '';
    for (let key in data) {
      text += `${key}: ${data[key]}
`;
    }

    const attachments = [];
    for (let field in files) {
      files[field].forEach(file => {
        attachments.push({
          filename: file.originalname,
          path: file.path
        });
      });
    }

    await transporter.sendMail({
      from: 'info@perkstreetfinancial.com',
      to: 'info@perkstreetfinancial.com',
      subject: 'New Application - PerkStreet Financial',
      text,
      attachments
    });

    res.status(200).send('Application submitted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing application');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});