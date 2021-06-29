'use strict'

const app = require('express')();
const cronJobs = require('./jobs/cron-jobs');

app.get('/health', function(req, res) {
    console.log('Keepalive service invoked');
    res.send();
});

app.listen(process.env.PORT || 3000, function() {
    console.log('Start up successful');
    cronJobs.init();
});
