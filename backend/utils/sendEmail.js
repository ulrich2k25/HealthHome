const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendEmail(to, subject, text) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `HealthHome <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log('📧 Email envoyé à :', to);
  } catch (error) {
    console.error('❌ Erreur d’envoi d’email :', error);
  }
}

module.exports = sendEmail;
