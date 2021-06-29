'use strict'

//TODO any better way to mock??

if (process.env.NODE_ENV == 'local_test') {
    const mock = require('./meli-dao-mock');

    const getCategories = function () {
        return mock.getCategories();
    }

    const getPublicationsWithFilters = function (category) {
        return mock.getPublicationsWithFilters(category);
    }

    const saveNotifiedPublication = async function (publications) {
    }

    const loadAlreadyNotifiedPublications = function (publicationIds) {
        return mock.loadAlreadyNotifiedPublications(publicationIds);
    }

    const loadBlacklist = function () {
        return mock.loadBlacklist()
    };

    exports.getCategories = getCategories;
    exports.getPublicationsWithFilters = getPublicationsWithFilters;
    exports.saveNotifiedPublication = saveNotifiedPublication;
    exports.loadAlreadyNotifiedPublications = loadAlreadyNotifiedPublications;
    exports.loadBlacklist = loadBlacklist;
} else {
    const meliRestDao = require('./meli-dao-rest');
    const meliDaoDb = require('./meli-dao-db');

    const getCategories = function () {
        return meliRestDao.getCategories();
    }

    const getPublicationsWithFilters = function (category) {
        return meliRestDao.getPublicationsWithFilters(category);
    }

    const saveNotifiedPublication = async function (publications) {
        return meliDaoDb.saveNotifiedPublication(publications);
    }

    const loadAlreadyNotifiedPublications = function (publicationIds) {
        return meliDaoDb.loadAlreadyNotifiedPublications(publicationIds);
    }

    const loadBlacklist = function () {
        return meliDaoDb.loadBlacklist()
    };

    exports.getCategories = getCategories;
    exports.getPublicationsWithFilters = getPublicationsWithFilters;
    exports.saveNotifiedPublication = saveNotifiedPublication;
    exports.loadAlreadyNotifiedPublications = loadAlreadyNotifiedPublications;
    exports.loadBlacklist = loadBlacklist;
}