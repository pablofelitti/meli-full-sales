'use strict'

const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'});
const ssm = new AWS.SSM()
const mysql = require('mysql2/promise')

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

const getConnection = async function getConnection() {

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

const saveNotifiedPublication = async function (publications, client) {

    try {
        await client.beginTransaction()
        let sql = 'insert into notified_publications (id, title, price, notified_date) values ?';
        await client.query(sql, [publications])
        await client.commit()
    } catch (e) {
        await client.rollback()
        throw e
    }
}

const updateNotifiedPublications = async function updateNotifiedPublications(publicationsToUpdate, client) {
    let ids = publicationsToUpdate.map(it => it.id)
    let notifiedDate = publicationsToUpdate[0].notified_date
    try {
        await client.beginTransaction()
        await client.query('update notified_publications set notified_date=? where id in (' + '\'' + ids.join('\', \'') + '\'' + ')', [notifiedDate])
        await client.commit()
    } catch (e) {
        await client.rollback()
        throw e
    }
}

const loadAlreadyNotifiedPublications = function (publicationIds, client) {
    return client.query('SELECT id, title, price, notified_date from notified_publications np where np.id in (\'' + publicationIds.join('\', \'') + '\')')
}

const loadBlacklist = function (client) {
    return client.query('SELECT id, title from blacklist bl')
}

exports.saveNotifiedPublication = saveNotifiedPublication
exports.loadAlreadyNotifiedPublications = loadAlreadyNotifiedPublications
exports.loadBlacklist = loadBlacklist
exports.updateNotifiedPublications = updateNotifiedPublications
exports.getConnection = getConnection