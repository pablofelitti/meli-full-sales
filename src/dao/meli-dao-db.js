'use strict'

const mysql = require('mysql');
const clientOptions = {
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: {
        rejectUnauthorized: false
    }
}
const client = mysql.createConnection(clientOptions);

const saveNotifiedPublication = async function (publications) {

    try {
        await client.query('BEGIN')
        await client.query('insert into notified_publications (id, title, price, notified_date) values (?)', publications, function(error) {
            if (error) throw error;
            client.end();
        })
        await client.query('COMMIT')
    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    }
}

const updateNotifiedPublications = async function updateNotifiedPublications(publicationsToUpdate) {
    let ids = publicationsToUpdate.map(it => it.id)
    let notifiedDate = publicationsToUpdate[0].notified_date
    try {
        await client.query('BEGIN')
        await client.query('update notified_publications set notified_date=? where id in (' + '\'' + ids.join('\', \'') + '\'' + ')', [notifiedDate], function (error) {
            if (error) throw error;
        })
        await client.query('COMMIT')
    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    }
}

const loadAlreadyNotifiedPublications = function (publicationIds) {
    return new Promise(resolve => {
        client.query('SELECT id, title, price, notified_date from notified_publications np where np.id in (\'' + publicationIds.join('\', \'') + '\')', function (error, results, fields) {
            if (error) throw error;
            return resolve(results);
        })
    })
}

const loadBlacklist = function () {
    return new Promise(resolve => {
        client.query('SELECT id, title from blacklist bl', function (error, results, fields) {
            if (error) throw error;
            return resolve(results);
        })
    })
}

exports.saveNotifiedPublication = saveNotifiedPublication
exports.loadAlreadyNotifiedPublications = loadAlreadyNotifiedPublications
exports.loadBlacklist = loadBlacklist
exports.updateNotifiedPublications = updateNotifiedPublications