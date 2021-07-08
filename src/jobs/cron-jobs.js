'use strict'

const cron = require('cron');
const meli = require('./meli');

let meliTaskRunning = false;

const configureMeliJob = function () {

    console.log('Meli job is enabled');

    let cronTime = process.env.MELI_CRON.replace(/_/g,' ');

    console.log('CRON: ' + cronTime)

    const meliJob = cron.job(cronTime, async function () {
        console.info('Meli cron job started');

        if (meliTaskRunning) {
            console.log('Meli job will not run as it is still running');
            return;
        }

        meliTaskRunning = true;

        await meli.retrieveCheapFullProducts();

        console.info('Meli cron job completed');

        meliTaskRunning = false;
    });

    meliJob.start();
}

const init = function () {
    configureMeliJob();
}

exports.init = init