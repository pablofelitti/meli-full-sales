'use strict'

const mysql = require('mysql');

const getParameters = async function () {
    const query = {Path: "/applications-db"}
    let ssmResponse = await ssm.getParametersByPath(query).promise();
    return {
        HOST: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/host')[0].Value,
        USER: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/user')[0].Value,
        PASSWORD: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/password')[0].Value,
        DATABASE: ssmResponse.Parameters.filter(it => it.Name === '/applications-db/database-meli')[0].Value
    }
}

async function getConnection() {

    const parameters = await getParameters()

    const clientOptions = {
        host: parameters.HOST,
        user: parameters.USER,
        password: parameters.PASSWORD,
        database: parameters.DATABASE,
        ssl: {
            rejectUnauthorized: false
        }
    }

    return mysql.createConnection(clientOptions)
}

const client = async () => await getConnection();

const saveNotifiedPublication = async function (publications) {

    try {
        await client.query('BEGIN')
        await client.query('insert into notified_publications (id, title, price, notified_date) values ?', [publications], function (error) {
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