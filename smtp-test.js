const { App } = require("@slack/bolt");
const store = require("./store");
const {v4 : uuidv4} = require('uuid');
const fetch = require("node-fetch");
const Bluebird = require("bluebird");
fetch.Promise = Bluebird;
const https = require("https");
const url = require("url");
const moment = require("moment");
const FAMILIES = require("./families.json");
const HOST = url.parse(
    `https://${process.env.MEDIC_USER}:${process.env.MEDIC_PASSWORD}@demo-cht.dev.medicmobile.org`
);
const DB = url.resolve(url.format(HOST), "medic/");
const API = url.resolve(url.format(HOST), "api/v1/");
const nodemailer = require("nodemailer");

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
    const rand_end = Math.floor(Math.random() * (9999 - 1000) + 1000);
    const user_password = "Health" + rand_end;
    const email_subject = "Your Community Health App Demo";
    const names = [];
    names[0] = 'sir-jones';
    names[1] = 'The-best';
    const user_name = `${names[0]
        .substring(0, 1)
        .toLowerCase()}${names[1].toLowerCase()}${rand_end}`;
    const email_body = `<div>Welcome to the Community Health Toolkit! To load your personal demo of a community health app built with our Core Framework, open the link below in Chrome or Firefox and enter your new username and password:</div><br><div>https://demo-cht.dev.medicmobile.org/ <br> username: ${user_name} <br> password: ${user_password}</div><br><div>It may take up to a minute for the app to load demo data, including sample families, people, history, and tasks. Once the tasks have populated, the app can run offline. Please note that the clinical protocols and guidance in the app are for demo purposes only. To explore tablet and mobile views, simply decrease the size of your browser window. </div><br><div><b>Join our community forum</b> at https://forum.communityhealthtoolkit.org/ to learn more about the CHT, ask us any questions, or tell us about your project!</div><br><div>Community Health Toolkit <br> www.communityhealthtoolkit.org</div><br>`;
    const info = await transporter.sendMail({
        from: '"CHT Demo Account (smtp2go)" <info@communityhealthtoolkit.org>',
        to: "info@communityhealthtoolkit.org",
        subject: email_subject,
        html: email_body, // HTML body
    });

    console.log("Message sent:", info.messageId);
})();
