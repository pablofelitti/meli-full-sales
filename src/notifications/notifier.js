'use strict'

const telegramNotifier = require('./telegram-notifier');

const notify = function (text) {
    telegramNotifier.sendMessage(text)
}

exports.notify = notify