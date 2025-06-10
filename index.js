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
const sgMail = require("@sendgrid/mail");

const relativeDateFields = [
  "lmp_date",
  "lmp_date_8601",
  "edd_8601",
  "t_pregnancy_follow_up_date",
  "t_danger_signs_referral_follow_up_date",
  "next_ancv_date",
  "t_fp_follow_up_date",
  "t_death_confirmation_date",
  "date_of_death",
  "t_alert_response_date",
  "t_treatment_follow_up_date",
  "t_referral_follow_up_date",
  "t_danger_signs_referral_follow_up_date",
  "t_malnutrition_referral_follow_up_date",
  "t_treatment_follow_up_date",
  "t_alert_response_date",
  "t_treatment_follow_up_date",
  "t_referral_follow_up_date",
  "t_danger_signs_referral_follow_up_date",
  "t_malnutrition_referral_follow_up_date",
  "t_immunization_follow_up_date",
  "t_danger_signs_referral_follow_up_date",
  "immunization_date",
  "c_immunization_date",
  "next_immunization",
  "delivery_date_8601",
  "delivery_date_f",
  "t_postnatal_follow_up_date",
  "t_danger_signs_referral_follow_up_date",
  "t_death_report_date",
  "delivery_date",
  "next_pnc",
];

const log = function (text) {
  app.logger.info(text);
};

function family(parent, name, contact) {
  this.name = name;
  this.type = "clinic";
  this.parent = parent;
  this.contact = contact;
}

// Used to set primary contact of family, or other place
function contact(id) {
  this.contact = id;
}

function person(place, name, dob, phone, sex) {
  this.name = name;
  this.phone = phone;
  this.date_of_birth = dob;
  this.dob_method = "approx";
  this.place = place;
  this.sex = sex;
  if (dob && typeof dob === "number") {
    this.date_of_birth = moment().subtract(dob, "days").format("YYYY-MM-DD");
  }
}

function createFamilies(contact_id) {
  get(DB + contact_id, function (contact) {
    postFamilies(contact, contact.parent._id);
  });
}

function postFamilies(user, parent) {
  let timeoutCnt = 0;
  for (const key in FAMILIES) {
    if (!FAMILIES.hasOwnProperty(key)) {
      continue;
    }

    setTimeout(
      function (key, timeoutCnt) {
        log("Creating: " + user.parent.name + " > " + key);

        post(
          API + "places",
          new family(parent, key),
          function (r, options) {
            if (r && r.id && r.id != "") {
              for (const child in FAMILIES[options.family]) {
                if (!FAMILIES[options.family].hasOwnProperty(child)) {
                  continue;
                }

                const newPerson = new person(
                  r.id,
                  child,
                  FAMILIES[options.family][child].date_of_birth,
                  FAMILIES[options.family][child].phone,
                  FAMILIES[options.family][child].sex
                );
                post(
                  API + "people",
                  newPerson,
                  function (r2, options) {
                    // Update family with contact
                    if (
                      options.object &&
                      options.object.primary_contact &&
                      options.object.primary_contact === true
                    ) {
                      post(API + "places/" + r.id, new contact(r2.id));
                    }
                    // Post any related reports
                    const forms = options.object.forms;
                    for (let i in forms) {

                      if (!forms.hasOwnProperty(i)) {
                        continue;
                      }
                      forms[i].contact = options.user;
                      forms[i].fields.patient_id = r2.id;
                      forms[i].fields.patient_name = options.person.name;
                      forms[i].fields.inputs = {};
                      forms[i].fields.inputs.source = "script";
                      forms[i].fields.inputs.contact = {};
                      forms[i].fields.inputs.contact._id = r2.id;
                      forms[i].fields.inputs.contact.name = options.person.name;
                      forms[i].fields.inputs.contact.sex = options.person.sex;
                      forms[i].fields.inputs.contact.date_of_birth =
                        options.person.date_of_birth;
                      forms[i].fields.inputs.contact.phone =
                        options.person.phone;
                      forms[i].fields.inputs.contact.parent = {};
                      forms[i].fields.inputs.contact.parent.contact = {};
                      forms[i].fields.inputs.contact.parent.contact.phone =
                        options.person.phone;

                      // Set reported date to ms since epoch if best guess is that value is # of days ago
                      const reported_date = moment().subtract(
                        forms[i].reported_date,
                        "days"
                      );
                      if (
                        forms[i].reported_date &&
                        typeof forms[i].reported_date === "number" &&
                        forms[i].reported_date < 100000
                      ) {
                        forms[i].reported_date = reported_date.valueOf();
                      }

                      for (let j = 0; j < relativeDateFields.length; j++) {
                        if (forms[i].fields[relativeDateFields[j]]) {
                          forms[i].fields[relativeDateFields[j]] =
                            getRelativeDate(
                              forms[i].fields[relativeDateFields[j]]
                            );
                        }
                      }

                      post(DB, forms[i]);
                    }
                  },
                  {
                    person: newPerson,
                    object: FAMILIES[options.family][child],
                    family: options.family,
                    user: options.user,
                  }
                );
              }
            }
          },
          {
            family: key,
            user: user,
          }
        );
      },
      timeoutCnt * 5000,
      key,
      timeoutCnt
    );
  }
}

function getRelativeDate(field) {
  if (field && typeof field === "number") {
    // Get the date X days ago
    return moment().subtract(field, "days").format("YYYY-MM-DD");
  } else {
    return field;
  }
}

function validateEmail(email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function sendEmail(msg) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  sgMail
    .send(msg)
    .then(() => {
      log("Email sent to: " + msg.to);
    })
    .catch((error) => {
      log(error);
    });
}

function get(str_url, callback, callback_options) {
  const options = url.parse(str_url);
  options.method = "GET";

  request(options, null, callback, callback_options);
}

function post(str_url, json_data, callback, callback_options) {
  const options = url.parse(str_url);
  options.headers = { "content-type": "application/json" };
  options.method = "POST";

  request(options, json_data, callback, callback_options);
}

function request(options, data, callback, callback_options) {
  const req = https.request(options, function (res) {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", function (d) {
      body += d;
    });

    res.on("end", function () {
      let parsed = "";
      try {
        parsed = JSON.parse(body);
      } catch (e) {
        log(
          "===================\nFAILED " +
            options.method +
            " " +
            options.href +
            "\n" +
            JSON.stringify(data, null, 2) +
            "\nResponse:\n" +
            body
        );
      }

      // do callback with the server response
      if (typeof callback != "undefined") {
        callback(parsed, callback_options);
      }
    });
  });

  req.on("error", function (e) {
    if (e) {
      log(e);
      throw e;
    }
  });

  // write data to request body
  if (data) {
    req.write(JSON.stringify(data));
  }
  req.end();
}

function slackUserCreate(name, email, say) {
  const url = `https://${process.env.MEDIC_USER}:${process.env.MEDIC_PASSWORD}@demo-cht.dev.medicmobile.org/api/v1`;

  const area_uuid = uuidv4();
  const names = name.split(" ");

  const area_json = {
    imported_date: new Date().toISOString(),
    parent: process.env.PARENT_UUID,
    _id: area_uuid,
    name: `${name} Area`,
    type: "health_center",
    use_cases: "anc pnc imm",
    vaccines:
      "bcg cholera hep_a hpv flu jap_enc meningococcal mmr mmrv polio penta pneumococcal rotavirus typhoid vitamin_a yellow_fever",
  };

  //say (JSON.stringify(area_json));

  const person_uuid = uuidv4();

  const person_json = {
    imported_date: new Date().toISOString(),
    place: area_uuid,
    _id: person_uuid,
    name: `${name}`,
    email: `${email}`,
    type: "person",
  };

  // say (JSON.stringify(person_json));

  const place_update_json = {
    contact: person_uuid,
  };

  const rand_end = Math.floor(Math.random() * (9999 - 1000) + 1000);
  const user_password = "Health" + rand_end;

  const user_name = `${names[0]
    .substring(0, 1)
    .toLowerCase()}${names[1].toLowerCase()}${rand_end}`;

  const user_json = {
    username: user_name,
    password: user_password,
    type: "chw",
    language: "en",
    known: true,
    place: area_uuid,
    contact: person_uuid,
    fullname: person_json.name,
  };

  const from_email = "CHT Demo Account <info@communityhealthtoolkit.org>";
  const to_email = email.substring(
    email.lastIndexOf(":") + 1,
    email.lastIndexOf("|")
  );
  const email_subject = "Your Community Health App Demo";
  const email_body = `<div>Welcome to the Community Health Toolkit! To load your personal demo of a community health app built with our Core Framework, open the link below in Chrome or Firefox and enter your new username and password:</div><br><div>https://demo-cht.dev.medicmobile.org/ <br> username: ${user_name} <br> password: ${user_password}</div><br><div>It may take up to a minute for the app to load demo data, including sample families, people, history, and tasks. Once the tasks have populated, the app can run offline. Please note that the clinical protocols and guidance in the app are for demo purposes only. To explore tablet and mobile views, simply decrease the size of your browser window. </div><br><div><b>Join our community forum</b> at https://forum.communityhealthtoolkit.org/ to learn more about the CHT, ask us any questions, or tell us about your project!</div><br><div>Community Health Toolkit <br> www.communityhealthtoolkit.org</div><br>`;

  const email_msg = {
    to: to_email,
    from: from_email,
    subject: email_subject,
    html: email_body,
  };

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(area_json),
  };

  fetch(`${url}/places`, options)
    .then((res) => res.json())
    .then(() => {
      options.body = JSON.stringify(person_json);
      return fetch(`${url}/people`, options);
    })
    .then((res) => res.json())
    .then(() => {
      options.body = JSON.stringify(place_update_json);
      return fetch(`${url}/places/${area_uuid}`, options);
    })
    .then((res) => res.json())
    .then(() => {
      options.body = JSON.stringify(user_json);
      return fetch(`${url}/users`, options);
    })
    .then((res) => res.json())
    .then(() => {
      createFamilies(person_uuid);
      say(
        `CHT demo account created! Username: ${user_name} Password: ${user_password}`
      );
    })
    .then((res) => {
      if (validateEmail(to_email)) {
        sendEmail(email_msg);
        say(`CHT demo account Email sent to ${to_email}!`);
      } else {
        log("Invalid Email");
      }
    })
    .catch(function (error) {
      log(error);
    });
}

function contactName(str) {
  return str.includes("Name: ");
}

function contactEmail(str) {
  return str.includes("Email: ");
}

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // Socket Mode doesn't listen on a port, but in case you want your app to respond to OAuth,
  // you still need to listen on some port!
  port: process.env.PORT || 3000
});

app.message(
  "please create a CHT demo account for the below",
  ({ message, say }) => {
    const text = message.text.split("\n");
    const contact = text.find(contactName).replace("Name:", "").trim();
    const email = text.find(contactEmail).replace("Email:", "").trim();

    app.logger.info('app message please create a CHT demo account for the below', contact,email);
    try {
      slackUserCreate(contact, email, say);
    } catch (error) {
      say(error);
    }
  }
);

app.event("app_home_opened", ({ event, say }) => {
  app.logger.info(`app event cht-app_home_opened-create`);
  const user = store.getUser(event.user);

  if (!user) {
    user = {
      user: event.user,
      channel: event.channel,
    };
    store.addUser(user);

    say(
      `Hello,<@${event.user}>, and welcome to the CHT Demo user creation bot!`
    );
  } else {
    say(` Hi <@${event.user}>, welcome back!`);
  }
});

app.message('hello', async ({ message, say }) => {
  await say(`Hey there <@${message.user}>!`);
  app.logger.info(`Hey there <@${message.user}>!`);
});

app.command("/cht-user-create", async ({ command, ack, say }) => {
  // Acknowledge command request
  await ack();

  app.logger.info(`app command cht-user-create`);
  if (command.text.length) {
    say("Creating User...");
    try {
      const params = command.text.split(" ");
      const name = `${params[0]} ${params[1]}`;
      slackUserCreate(name, params[2], say);
    } catch (error) {
      say(error);
    }
  } else {
    say(
      "Please provide  the user's name and email in the right format. Example: /cht-user-create FirstName LastName hello@me.org"
    );
  }
});

(async () => {
  await app.start();
  log('⚡️ Bolt app is running!');
})();
