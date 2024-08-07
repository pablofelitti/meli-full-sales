'use strict'

const meliDaoDb = require('./meli-dao-db');
const meliDaoRest = require('./meli-dao-rest');
const dateUtils = require('./date-utils')
const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'})
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

async function updateNotifiedPublications(publicationsToUpdate, currentDatetime) {
    let publications = publicationsToUpdate.map(it => {
        return {'id': it.id, 'notified_date': currentDatetime}
    });
    return meliDaoDb.updateNotifiedPublications(publications);
}

function unifyId(id) {
    let noPrefixId = id.replace('MLA', '');
    return parseInt(noPrefixId);
}

const retrieveCheapFullProducts = async function () {

    let categories = await meliDaoRest.getCategories()

    console.log(categories.length + ' categories retrieved');

    let allCategoriesPublicationPromises = categories.map(category => {
        return meliDaoRest.getPublicationsWithFilters(category);
    });

    let blacklist = await meliDaoDb.loadBlacklist()

    let publications = await Promise.all(allCategoriesPublicationPromises)
    publications = publications.reduce((prev, curr) => curr.concat(prev));

    console.log('Received these publications from Mercado Libre:')
    console.log(JSON.stringify(publications.map(it => unifyId(it.id))))

    console.log('Blacklisted items found:')
    let blacklistIds = blacklist.map(blacklistItem => unifyId(blacklistItem.id));
    console.log(JSON.stringify(publications.map(it => unifyId(it.id)).filter(publicationId => blacklistIds.includes(publicationId))))

    publications = publications.filter(publication => !blacklistIds.includes(unifyId(publication.id)))
    let alreadyNotifiedPublications = await meliDaoDb.loadAlreadyNotifiedPublications(publications.map(it => unifyId(it.id)))

    let publicationsToUpdate = []
    let currentDatetime = dateUtils.currentDate();
    let alreadyNotifiedPublicationResults = alreadyNotifiedPublications
        .filter(it => {
            let Difference_In_Time = Math.abs(new Date(it.notified_date).getTime() - currentDatetime.getTime())
            let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24)
            if (Difference_In_Days >= 10) {
                publicationsToUpdate.push(it)
                return false
            }
            return true
        })
    const alreadyNotifiedPublicationsIds = alreadyNotifiedPublicationResults
        .map(it => it.id)

    console.log('Publications already sent:')
    console.log(JSON.stringify(alreadyNotifiedPublicationsIds))

    let publicationsReadyToNotify = publications
        .filter(it => !alreadyNotifiedPublicationsIds.includes(unifyId(it.id)))

    publicationsReadyToNotify = unique(publicationsReadyToNotify)

    if (publicationsReadyToNotify.length !== 0) {

        console.log('Publications ready to be notified:');
        console.log(publicationsReadyToNotify.map(it => unifyId(it.id)));

        for (let pub of publicationsReadyToNotify) {
            await sendQueue(createNotificationMessage(pub))
        }

        publicationsReadyToNotify = publicationsReadyToNotify.filter(it => !publicationsToUpdate.map(it2 => it2.id).includes(unifyId(it.id)))

        if (publicationsReadyToNotify.length > 0) {
            let newPublicationsNotified = await meliDaoDb.saveNotifiedPublication(publicationsReadyToNotify, currentDatetime)

            if (publicationsToUpdate.length === 0) {
                return newPublicationsNotified
            } else {
                let oldPublicationsUpdated = await updateNotifiedPublications(publicationsToUpdate, currentDatetime)
                return [newPublicationsNotified, oldPublicationsUpdated]
            }
        } else {
            return await updateNotifiedPublications(publicationsToUpdate, currentDatetime)
        }
    } else {
        console.log('No new publications to notify');
    }
}

function unique(itemWithDuplicates) {
    let result = [];
    itemWithDuplicates.forEach(function (item) {
        if (result.map(it => unifyId(it.id)).indexOf(unifyId(item.id)) < 0) {
            result.push(item)
        }
    })
    return result
}

const createNotificationMessage = function (publication) {
    return "Producto FULL con envío gratis!\n\nDescripción: " + publication.title + "\n\nPrecio: " + publication.price + "\n\nLink: " + publication.permalink;
}

async function sendQueue(data) {

    let sqsOrderData = {
        MessageAttributes: {
            "EnvironmentId": {
                DataType: "String",
                StringValue: process.env.ENVIRONMENT
            },
            "Channel": {
                DataType: "String",
                StringValue: "ofertas"
            }
        },
        MessageBody: data,
        QueueUrl: process.env.SQS_QUEUE_URL
    }

    console.log('sending message')
    //TODO this could be enhaced in the future to batch messages
    await sqs.sendMessage(sqsOrderData).promise();
    console.log('message sent')
}

exports.retrieveCheapFullProducts = retrieveCheapFullProducts