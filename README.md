# meli-full-sales

## Installation

Just `npm install`

## Tasks

| Name                           | Description                                             |
|--------------------------------|---------------------------------------------------------|
| `npm run start:local`          | run with notifications and db mocked                    |
| `npm run start:deploy`         | run with notifications and db (see tokens to set)       |
| `npm run meli`                 | run meli only with notifications and db mocked          |

## Environment variables

```bash
#Telegram configuration
export TELEGRAM_BOT_TOKEN=<telegram_bot_access_key>
export TELEGRAM_CHANNEL=<telegram_channel>

#Database configuration
export PGHOST=<postgre_host>
export PGDATABASE=<postgre_database>
export PGPASSWORD=<postgre_password>
export PGUSER= <postgre_user>
```

## Deployment

When pushed, a Github Action runs and pushes the code to Heroku using Docker

## TODO list

- [ ] This program does not support multiple instances as we control with a system variable whether a job to analyze is running or not, it should be refactored to support multiple instances
- [ ] Mock with proxyquire
- [ ] Add unit tests