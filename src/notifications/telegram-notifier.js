'use strict'
const TeleBot = require('telebot');

const getParameters = async function () {
    const query = {Path: "/applications-db"}
    let ssmResponse = await ssm.getParametersByPath(query).promise();
    return {
        TELEGRAM_CHANNEL: ssmResponse.Parameters.filter(it => it.Name === '/telegram-ids/dev/ofertas')[0].Value,
        TELEGRAM_TOKEN: ssmResponse.Parameters.filter(it => it.Name === '/telegram-ids/dev/token')[0].Value
    }
}

const parameters = async () => await getParameters()

const initBot = async function () {
    const bot = new TeleBot(parameters.TELEGRAM_TOKEN)
    bot.start()
    return bot
}

const bot = async () => await initBot()

const sendMessage = function (texto) {
    console.log('Sending telegram message: ' + texto);
    bot.sendMessage(parameters.TELEGRAM_CHANNEL, texto)
        .catch(err => console.error(err));
}

exports.sendMessage = sendMessage;