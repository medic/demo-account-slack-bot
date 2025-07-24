const nodemailer = require("nodemailer");
const { argv } = require('node:process');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_URL,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Wrap in an async IIFE so we can use await.
(async () => {
    const email_subject = `SMTP Demo Test Email (${process.env.SMTP_URL})`;
    const email_body = `<div>Test email</div><div>Good job</div>`;
    const info = await transporter.sendMail({
        from: `"The Community Health Toolkit" <info@communityhealthtoolkit.org>`,
        to: process.argv[2],
        subject: email_subject,
        html: email_body, // HTML body
    });
    console.log("Message sent:", info.messageId);
})();
