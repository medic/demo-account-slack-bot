# Demo account slack bot

Node app to listen to slack channel for requests for accounts on demo.dev.medcimobile.org:

1. Person submits form on [contact page](https://communityhealthtoolkit.org/contact) requesting a demo account 
2. A Slack message is sent in #cht-demo-setup Slack channel from Squarespace through Zapier
3. This repository's bot runs on an EC2 instance (Medic's Watchdog server, a [good place to run Docker stuffs](https://github.com/medic/medic-infrastructure/issues/1178#issuecomment-3119802989)), that listens to specific Slack messages or slash commands and creates a demo account in demo-cht.dev.medicmobile.org.
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

1. clone this repo: `git clone https://github.com/medic/demo-account-slack-bot.git`
2. ensure you have node 22 
3. cd into the repo 
4. copy `env.example` to `.env` and populate secrets - using demo [secrets from 1pass](https://start.1password.com/open/i?a=FS6VLBPCXJGBTFO3LV4R74OA6E&v=v3osjt24pw5ngyirgee7hub56u&i=wzcncuy5igsmg6hbl7hpclrzoa&h=medic.1password.com)
5. install dependencies `npm ci`
6. run it `npm run start`

#### Testing Slack

In the `#demo-account-testing` [channel](https://medic.slack.com/archives/C06S8FGL55X/p1713292431645859?thread_ts=1713290993.631819&cid=C06S8FGL55X) , you can paste the following code to trigger the bot.  This is the slowest, noisiest way to test, but is a full e2e test. Replace test values with your own:

```shell
Hello - please create a CHT demo account for the below:

Name: test-ignore test-ignore2222
Email: testing@example.org
Demo sign up: Yes
```

You should get back something like:

```shell
CHT demo account created! Username: ttest641 Password: Pass1235
CHT demo account Email sent to testore@medic.org!
```


#### Testing Locally

To avoid the round trip via Slack, you can test locally by calling the `/cht-user-create-test` endpoint.  Each time the server starts it will generate a new, secret URL to use based on a UUID.  For example:

```shell
[INFO]  bolt-app ⚡️ Bolt app is running!
[INFO]  bolt-app Secret test URL - this changes every start:

  curl -X POST http://localhost:4000/cht-user-create-test/a16676a8-c135-4d73-aa9a-d00cce931343
```

And then the test `curl` call looks like:

```shell
curl -X POST http://localhost:4000/cht-user-create-test/a16676a8-c135-4d73-aa9a-d00cce931343
Test user request sent
```

This will use the `TEST_NAME` and `TEST_EMAIL` from your `.env` file.

#### Testing SMTP

Make sure `.env` file has correct values and run test script. For example to email `mrjones@medic.org` (but use your email!):

```bash
node --env-file=.env smtp-test.js mrjones@medic.org
```

You should get back:

```bash
Message sent: <22adffea-4fb3-c192-1ec7-6c75d0fe5518@communityhealthtoolkit.org>
```

And an email should be sent with the subject showing which email provider was used:

```bash
SUBJECT: SMTP Demo Test Email (email-smtp.eu-west-2.amazonaws.com)
FROM: The Community Healthtoolkit
DATE: 12:11 PM (4 minutes ago)
BODY:    
    Test email
    Good job
```

### Releasing a new version 

To ensure the docker image gets rebuilt when new code is released, be sure to update the `image` value in the `compose.yaml` [file](https://github.com/medic/demo-account-slack-bot/blob/main/compose.yaml). So if you were on version `1.0` and released a new version, you would change the line to be `1.1` like so:

```yaml
   image: medic-demo-account-slack-bot:1.1
```


## Production 

1. clone the repo: `git clone https://github.com/medic/demo-account-slack-bot.git`
2. copy `env.example` to `.env` and populate production [secrets from 1pass](https://start.1password.com/open/i?a=FS6VLBPCXJGBTFO3LV4R74OA6E&v=3xw7qcbg2snbgpt3j25bljlmlm&i=lxb4dh4gc45tlvydyny7nomawa&h=medic.1password.com)
3. run `docker compose up -d`

### Updates

#### Code

To update the service when there's code changes, first commit them to this repo.  Then SSH to where docker is running and run:
1. `docker compose down -v # stops service and deletes any ephemeral data`
2. `git pull origin main # pulls in latest code from github`
3. `docker pull node:22-alpine # updates node image`
4. `docker compose up -d # starts service in the background, optionally rebuilding the local cached image if need be`
5. `docker logs -f demo-account-slack-bot-node-1 # optional call to check logs - ctrl + c to exit when done`

#### Config

All configuration is stored in the `.env` file.  If you need to make configuration changes, edit the `.env` file.  Then run `docker compose restart` to make the changes take effect.
