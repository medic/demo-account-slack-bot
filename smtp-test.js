const nodemailer = require("nodemailer");
const { argv } = require('node:process');
const { email_body, email_subject } = require('./email.content');

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
    const email_subject_updated = `${email_subject} -- SMTP Demo Test Email (${process.env.SMTP_URL})`;
    const email_body_updated = `<div>Test email</div> <br/> ${email_body}`;

    const info = await transporter.sendMail({
        from: `"The Community Health Toolkit" <info@communityhealthtoolkit.org>`,
        to: process.argv[2],
        subject: email_subject_updated,
        html: email_body_updated, // HTML body
    });
    console.log("Message sent:", info.messageId);
})();
