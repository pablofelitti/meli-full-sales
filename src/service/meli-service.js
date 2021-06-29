'use strict'

const meliDao = require('../dao/meli-dao');
const notifier = require('../notifications/notifier');

const getCategories = function () {
    return meliDao.getCategories();
}

const retrieveCheapFullProducts = function () {

    let categories = getCategories();

    categories.then(categories => {
        console.log(categories.length + ' categories retrieved');

        let allCategoriesPublicationPromises = categories.map(category => {
            return getPublicationsWithFilters(category);
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

        publicationsPromise.then(publications => {

            meliDao.loadAlreadyNotifiedPublications(publications.map(it => it.id))
                .then(alreadyNotifiedPublications => {

                    const alreadyNotifiedPublicationsIds = alreadyNotifiedPublications.map(it => it.id);

                    console.log('Publications already sent:');
                    console.log(alreadyNotifiedPublicationsIds);

                    const publicationsReadyToNotify = publications
                        .filter(it => !alreadyNotifiedPublicationsIds.includes(it.id));

                    if (publicationsReadyToNotify.length !== 0) {

                        console.log('Publications ready to be notified:');
                        console.log(publicationsReadyToNotify.map(it => it.id));

                        publicationsReadyToNotify.forEach(it => {
                            notifier.notify(createNotificationMessage(it));
                        });

                        meliDao.saveNotifiedPublication(publicationsReadyToNotify);
                    } else {
                        console.log('No new publications to notify');
                    }
                })
                .catch(e => console.error(e.stack));
        });
    });
}

const createNotificationMessage = function (publication) {
    return "Producto FULL con envío gratis!\n\nDescripción: " + publication.title + "\n\nPrecio: " + publication.price + "\n\nLink: " + publication.permalink;
}

const getPublicationsWithFilters = function (category) {
    return meliDao.getPublicationsWithFilters(category);
}

exports.retrieveCheapFullProducts = retrieveCheapFullProducts;