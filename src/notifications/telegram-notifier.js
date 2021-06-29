'use strict'
const TeleBot = require('telebot');
const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN);
bot.start();

const sendMessage = function(texto) {
    console.log('Sending telegram message: ' + texto);
	bot.sendMessage(process.env.TELEGRAM_CHANNEL, texto)
		.catch(err => console.error(err));
}

exports.sendMessage = sendMessage;