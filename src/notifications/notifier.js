'use strict'

//TODO any better way to mock??

let notify

if (process.env.NODE_ENV === 'local_test') {
	const notifierMock = require('./notifier-mock');

	notify = function (text) {
		notifierMock.sendMessage(text);
	};
} else {
	const telegramNotifier = require('./telegram-notifier');

	notify = function (text) {
		telegramNotifier.sendMessage(text);
	};
}

exports.notify = notify