
const express = require('express');
const bodyParser = require('body-parser');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.post('/submit', async (req, res) => {
  const { name, email, message } = req.body;
  const msg = {
    to: 'info@perkstreetfinancial.com',
    from: 'info@perkstreetfinancial.com',
    subject: 'New Form Submission',
    text: `Name: ${name}
Email: ${email}
Message: ${message}`,
  };

  try {
    await sgMail.send(msg);
    res.status(200).send('Email sent');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to send');
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
    