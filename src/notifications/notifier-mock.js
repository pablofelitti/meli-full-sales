'use strict'

const sendMessage = function(text) {
	console.log('[--- MOCK NOTIFIER ---]' + text);
}

exports.sendMessage = sendMessage;