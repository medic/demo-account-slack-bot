# Demo account slack bot

Node app to listen to slack channel for requests for accounts on demo.dev.medcimobile.org:

1. Person submits form on [contact page](https://communityhealthtoolkit.org/contact) requesting a demo account 
2. A Slack message is sent in #cht-demo-setup Slack channel from Squarespace through Zapier
3. This repository's  bot runs (originally on [Glitch](https://glitch.com/edit/#!/pattern-sulfur?path=index.js%3A334%3A112), see [#medic-infrastructure/issues/1170](https://github.com/medic/medic-infrastructure/issues/1170)), that listens to specific Slack messages or slash commands and creates a demo account in demo-cht.dev.medicmobile.org.
4. This same bot sends an email to the person who submitted the form with their credentials for their demo account using an SMTP provider


## Running 

### Create a Slack app

This is needed for both prod and dev.  Consider setting up two Slack apps so you can easily test dev by switching out `SLACK_SIGNING_SECRET`, `SLACK_APP_TOKEN` and `SLACK_BOT_TOKEN` and having each app point to a different channel in slack.

Follow the [Slack Bolt docs for creating an app](https://tools.slack.dev/bolt-js/getting-started#create-an-app). After you create the app, add it your channel by going to the app and clicking "Add BOT-NAME-HERE to a channel".  I could not get it to work by going to the channel and adding the app :shrug:

Be sure it has the following perms:
* chat:write
* channels:history
* groups:history
* users:read

As well, be sure to enable socket for the app:

1. go to the [Slack API Page](https://api.slack.com/apps)
2. click on your app
3. go to "Socket Mode"
4. make sure "Enable Socket Mode" is enabled

### Development

1. clone this repo
2. ensure you have node 22 
3. cd into the repo 
4. copy `env.example` to `.env` and populate secrets - using demo [secrets from 1pass](https://start.1password.com/open/i?a=FS6VLBPCXJGBTFO3LV4R74OA6E&v=v3osjt24pw5ngyirgee7hub56u&i=wzcncuy5igsmg6hbl7hpclrzoa&h=medic.1password.com)
5. install dependencies `npm ci`
6. run it `npm run start`

## Production 

1. clone the repo
2. copy `env.example` to `.env` and populate [secrets from 1pass](https://start.1password.com/open/i?a=FS6VLBPCXJGBTFO3LV4R74OA6E&v=3xw7qcbg2snbgpt3j25bljlmlm&i=lxb4dh4gc45tlvydyny7nomawa&h=medic.1password.com)
3. run `docker compose up -d`

## Logs from Glitch

This may be helpful in trying to bootstrap the app in a more modern environment like docker or EKS:


```bash

No Node version was specified; we are using default version 10. You can change this in package.json: https://help.glitch.com/hc/en-us/articles/16287495688845-Can-I-change-the-version-of-node-js-my-project-uses-

node v10.24.1, npm 6.14.12
Installing...
audited 102 packages in 4.079s

1 package is looking for funding
  run `npm fund` for details

found 35 vulnerabilities (6 low, 14 moderate, 15 high)
  run `npm audit fix` to fix them, or `npm audit` for details

Total install time: 11672ms
🔼💮 ⚡️ Bolt app is running!

No Node version was specified; we are using default version 10. You can change this in package.json: https://help.glitch.com/hc/en-us/articles/16287495688845-Can-I-change-the-version-of-node-js-my-project-uses-

node v10.24.1, npm 6.14.12
Installing...
audited 102 packages in 3.383s

1 package is looking for funding
  run `npm fund` for details

found 35 vulnerabilities (6 low, 14 moderate, 15 high)
  run `npm audit fix` to fix them, or `npm audit` for details

Total install time: 10879ms
🎧🖤 ⚡️ Bolt app is running!

No Node version was specified; we are using default version 10. You can change this in package.json: https://help.glitch.com/hc/en-us/articles/16287495688845-Can-I-change-the-version-of-node-js-my-project-uses-

node v10.24.1, npm 6.14.12
Installing...
audited 102 packages in 3.383s

1 package is looking for funding
  run `npm fund` for details

found 35 vulnerabilities (6 low, 14 moderate, 15 high)
  run `npm audit fix` to fix them, or `npm audit` for details

Total install time: 10879ms
🥄🪝 ⚡️ Bolt app is running!
```
