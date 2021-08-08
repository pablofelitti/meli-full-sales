'use strict'

const meliDao = require('../dao/meli-dao');
const notifier = require('../notifications/notifier');
const dateUtils = require('../utils/date-utils')

const retrieveCheapFullProducts = async function () {

    return new Promise(function (resolve, reject) {
        let categories = meliDao.getCategories()

        return categories.then(categories => {
            console.log(categories.length + ' categories retrieved');

            let allCategoriesPublicationPromises = categories.map(category => {
                return meliDao.getPublicationsWithFilters(category);
            });

            let blacklistPromise = meliDao.loadBlacklist()

            let publicationsPromise = Promise.all(allCategoriesPublicationPromises).then(it => {
                let publications = it.reduce((prev, curr) => curr.concat(prev));

                console.log('Received these publications from Mercado Libre:')
                console.log(publications.map(it => it.id))

                return blacklistPromise.then(blacklist => {

                    console.log('Blacklisted items found:')
                    console.log(publications.map(it => it.id).filter(publicationId => blacklist.map(blacklistItem => blacklistItem.id).includes(publicationId)))

                    return publications.filter(publication => !blacklist.map(blacklistItem => blacklistItem.id).includes(publication.id))
                })
            })

            return publicationsPromise.then(publications => {

                return meliDao.loadAlreadyNotifiedPublications(publications.map(it => it.id))
                    .then(alreadyNotifiedPublications => {

                        let currentDatetime = dateUtils.currentDate();
                        const alreadyNotifiedPublicationsIds = alreadyNotifiedPublications
                            .filter(it => {
                                let Difference_In_Time = Math.abs(new Date(it.notified_date).getTime() - currentDatetime.getTime())
                                let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24)
                                if (Difference_In_Days >= 10) return false
                                return true
                            })
                            .map(it => it.id)

                        console.log('Publications already sent:');
                        console.log(alreadyNotifiedPublicationsIds);

                        const publicationsReadyToNotify = publications
                            .filter(it => !alreadyNotifiedPublicationsIds.includes(it.id))

                        if (publicationsReadyToNotify.length !== 0) {

                            console.log('Publications ready to be notified:');
                            console.log(publicationsReadyToNotify.map(it => it.id));

                            publicationsReadyToNotify.forEach(it => {
                                notifier.notify(createNotificationMessage(it));
                            });

                            return meliDao.saveNotifiedPublication(publicationsReadyToNotify.map(it => [it.id, it.title, it.price, currentDatetime]))
                                .then(() => {
                                    resolve()
                                });
                        } else {
                            console.log('No new publications to notify');
                            resolve()
                        }
                    })
                    .catch(e => {
                        console.error(e.stack)
                        reject()
                    });
            });
        });
    })
}

const createNotificationMessage = function (publication) {
    return "Producto FULL con envío gratis!\n\nDescripción: " + publication.title + "\n\nPrecio: " + publication.price + "\n\nLink: " + publication.permalink;
}

exports.retrieveCheapFullProducts = retrieveCheapFullProducts