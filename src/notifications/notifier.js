'use strict'

//TODO any better way to mock??

if (process.env.NODE_ENV === 'local_test') {
	const notifierMock = require('./notifier-mock');

	exports.notify = function (text) {
		notifierMock.sendMessage(text);
	};
} else {
	const telegramNotifier = require('./telegram-notifier');

	exports.notify = function (text) {
		telegramNotifier.sendMessage(text);
	};
}