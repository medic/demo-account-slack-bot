# Demo account slack bot

Node app to listen to slack channel for requests for accounts on demo.dev.medcimobile.org:

1. Person submits form on [contact page](https://communityhealthtoolkit.org/contact) requesting  a demo account 
2. A Slack message is sent in #cht-demo-setup Slack channel from Squarespace through Zapier
3. This repositories  bot runs (originally on [Glitch](https://glitch.com/edit/#!/pattern-sulfur?path=index.js%3A334%3A112), see [#medic-infrastructure/issues/1170](https://github.com/medic/medic-infrastructure/issues/1170)), that listens to specific Slack messages or slash commands and creates a demo account in demo-cht.dev.medicmobile.org.
4. This same bot sends An email is set to the person who submitted the form with their credentials for their demo account using Sendgrid

## Development

1. clone this repo
2. ensure you have node 22 
3. cd into the repo 
4. copy `env.example` to `.env` and populate secrets - careful about running produciton secrets so two emails aren't sent to end users!
5. install dependencies `node ci`
6. run it `node --env-file=.env index.js`

## Deployment

1. clone the repo
2. copy `env.example` to `.env` and populate secrets 
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
