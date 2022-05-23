'use strict'

const meliDao = require('../dao/meli-dao');
const dateUtils = require('../utils/date-utils')
const AWS = require('aws-sdk')
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

async function updateNotifiedPublications(publicationsToUpdate, currentDatetime, client) {
    let publications = publicationsToUpdate.map(it => {
        return {'id': it.id, 'notified_date': currentDatetime}
    });
    return meliDao.updateNotifiedPublications(publications, client);
}

function unifyId(id) {
    let noPrefixId = id.replace('MLA', '');
    return parseInt(noPrefixId);
}

const retrieveCheapFullProducts = async function () {

    const client = await meliDao.getConnection()

    let categories = await meliDao.getCategories()

    console.log(categories.length + ' categories retrieved');

    let allCategoriesPublicationPromises = categories.map(category => {
        return meliDao.getPublicationsWithFilters(category, client);
    });

    let blacklist = await meliDao.loadBlacklist(client)

    let publications = await Promise.all(allCategoriesPublicationPromises)
    publications = publications.reduce((prev, curr) => curr.concat(prev));

    console.log('Received these publications from Mercado Libre:')
    console.log(JSON.stringify(publications.map(it => unifyId(it.id))))

    console.log('Blacklisted items found:')
    console.log(JSON.stringify(publications.map(it => unifyId(it.id)).filter(publicationId => blacklist.map(blacklistItem => blacklistItem.id).includes(publicationId))))

    publications = publications.filter(publication => !blacklist.map(blacklistItem => blacklistItem.id).includes(unifyId(publication.id)))

    let alreadyNotifiedPublications = await meliDao.loadAlreadyNotifiedPublications(publications.map(it => unifyId(it.id)), client)

    let publicationsToUpdate = []
    let currentDatetime = dateUtils.currentDate();
    let alreadyNotifiedPublicationResults = alreadyNotifiedPublications[0]
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
            let newPublicationsNotified = await meliDao.saveNotifiedPublication(publicationsReadyToNotify.map(it => [unifyId(it.id), it.title, it.price, currentDatetime]), client)

            if (publicationsToUpdate.length === 0) {
                return newPublicationsNotified
            } else {
                let oldPublicationsUpdated = await updateNotifiedPublications(publicationsToUpdate, currentDatetime, client)
                return [newPublicationsNotified, oldPublicationsUpdated]
            }
        } else {
            return await updateNotifiedPublications(publicationsToUpdate, currentDatetime, client)
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
                StringValue: "dev"
            },
            "Channel": {
                DataType: "String",
                StringValue: "ofertas"
            }
        },
        MessageBody: data,
        QueueUrl: "https://sqs.us-east-1.amazonaws.com/869579352973/telegram-sender-TelegramMessageQueue-KYD24H0d3j9e"
    }

    console.log('sending message')
    await sqs.sendMessage(sqsOrderData).promise();
    console.log('message sent')
}

exports.retrieveCheapFullProducts = retrieveCheapFullProducts