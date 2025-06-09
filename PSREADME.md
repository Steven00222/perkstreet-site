# PerkStreet Financial Onboarding Portal

This project is a fully responsive, professional onboarding web portal for **PerkStreet Financial**, inspired by Brex’s modern design and user flow.

It includes:

- ✅ A frontend homepage with branded layout, sections for **About**, **Contact**, **Testimonials**, and a dynamic **Apply Now** onboarding form.
- ✅ A Node.js backend that uses **SendGrid** to send the complete application details (including file uploads) to your business email.
- ✅ Secure form submission and support for documents like SSN, EIN/TAX ID, government-issued ID, and up to 6 months of business account statements.

---

## 🔧 Folder Structure

```
Perkstreet-site/
├── backend/
│   ├── server.js         # Backend email handling
│   └── .env              # (DO NOT UPLOAD) Your sensitive API keys
├── frontend/
│   └── index.html        # Main web page
├── README.md             # This file
```

---

## 🔐 Environment Variables (Set These on [Render.com](https://render.com))

You do **not** need to upload `.env` to GitHub. Instead, go to **Render → Environment → Add Environment Variables** and enter:

```
SENDGRID_API_KEY=your_sendgrid_api_key
RECEIVER_EMAIL=info@yourdomain.com
```

---

## 🚀 Deployment Notes

- **Frontend** is deployed on Render as a **Static Site**.
- **Backend** is deployed on Render as a **Web Service** using **Node.js** and Express.
- Ensure your backend service points to the correct **`/submit`** endpoint.

---

## 📩 What Happens On Submission

When the form is submitted:
- All input data (A–Z) is securely captured.
- File uploads (ID, SSN, EIN/TAX ID, and 6 months of bank statements) are attached.
- An automatic confirmation message is shown to the user.
- A professional email containing all submission details is sent to your **business email**.

---

## 📬 Contact

If you need support or further customization, reach out to your developer or team lead.

---
