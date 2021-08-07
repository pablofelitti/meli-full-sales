'use strict'

const {Client} = require('pg');
const format = require('pg-format');

const clientOptions = {
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: {
        rejectUnauthorized: false
    }
}
const client = new Client(clientOptions);
client.connect();

const saveNotifiedPublication = async function (publications) {

    try {
        await client.query('BEGIN')
        const res = await client.query(format('insert into notified_publications (id, title, price, notified_date) values %L', publications), [])
        await client.query('COMMIT')
    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    }
}

const loadAlreadyNotifiedPublications = function (publicationIds) {
    return client
        .query('SELECT id, title, price, notified_date from notified_publications np where np.id in (\'' + publicationIds.join('\', \'') + '\')')
        .then(queryResult => queryResult.rows)
}

const loadBlacklist = function () {
    return client
        .query('SELECT id, title from blacklist bl')
        .then(queryResult => queryResult.rows)
}

exports.saveNotifiedPublication = saveNotifiedPublication
exports.loadAlreadyNotifiedPublications = loadAlreadyNotifiedPublications
exports.loadBlacklist = loadBlacklist