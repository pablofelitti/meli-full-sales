'use strict'

const meliDao = require('../dao/meli-dao');
const notifier = require('../notifications/notifier');
const dateUtils = require('../utils/date-utils')

function updateNotifiedPublications(publicationsToUpdate, currentDatetime) {
    return meliDao.updateNotifiedPublications(publicationsToUpdate.map(it => {
        return {'id': it.id, 'notified_date': currentDatetime}
    }));
}

function unifyId(id) {
    let noPrefixId = id.replace('MLA', '');
    return parseInt(noPrefixId);
}

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
                console.log(publications.map(it => unifyId(it.id)))

                return blacklistPromise.then(blacklist => {

                    console.log('Blacklisted items found:')
                    console.log(publications.map(it => unifyId(it.id)).filter(publicationId => blacklist.map(blacklistItem => blacklistItem.id).includes(publicationId)))

                    return publications.filter(publication => !blacklist.map(blacklistItem => blacklistItem.id).includes(unifyId(publication.id)))
                })
            })

            return publicationsPromise.then(publications => {

                return meliDao.loadAlreadyNotifiedPublications(publications.map(it => unifyId(it.id)))
                    .then(alreadyNotifiedPublications => {

                        let publicationsToUpdate = []
                        let currentDatetime = dateUtils.currentDate();
                        const alreadyNotifiedPublicationsIds = alreadyNotifiedPublications
                            .filter(it => {
                                let Difference_In_Time = Math.abs(new Date(it.notified_date).getTime() - currentDatetime.getTime())
                                let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24)
                                if (Difference_In_Days >= 10) {
                                    publicationsToUpdate.push(it)
                                    return false
                                }
                                return true
                            })
                            .map(it => it.id)

                        console.log('Publications already sent:');
                        console.log(alreadyNotifiedPublicationsIds);

                        let publicationsReadyToNotify = publications
                            .filter(it => !alreadyNotifiedPublicationsIds.includes(unifyId(it.id)))

                        publicationsReadyToNotify = unique(publicationsReadyToNotify)

                        if (publicationsReadyToNotify.length !== 0) {

                            console.log('Publications ready to be notified:');
                            console.log(publicationsReadyToNotify.map(it => unifyId(it.id)));

                            publicationsReadyToNotify.forEach(it => {
                                notifier.notify(createNotificationMessage(it));
                            });

                            publicationsReadyToNotify = publicationsReadyToNotify.filter(it => !publicationsToUpdate.map(it2 => it2.id).includes(unifyId(it.id)))

                            if (publicationsReadyToNotify.length > 0) {
                                let newPublicationsNotified = meliDao.saveNotifiedPublication(publicationsReadyToNotify.map(it => [unifyId(it.id), it.title, it.price, currentDatetime]))
                                    .then(() => {
                                        resolve()
                                    });

                                if (publicationsToUpdate.length === 0) {
                                    return newPublicationsNotified.then(() => resolve())
                                } else {
                                    let oldPublicationsUpdated = updateNotifiedPublications(publicationsToUpdate, currentDatetime)
                                    return Promise.all([newPublicationsNotified, oldPublicationsUpdated]).then(() => resolve())
                                }
                            } else {
                                return updateNotifiedPublications(publicationsToUpdate, currentDatetime).then(() => resolve())
                            }
                        } else {
                            console.log('No new publications to notify');
                            resolve()
                        }
                    })
                    .catch(e => {
                        console.error(e)
                        reject()
                    });
            });
        }).catch(e => {
            console.error("Error loading MELI categories")
            console.error(e)
        })
    })
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

exports.retrieveCheapFullProducts = retrieveCheapFullProducts