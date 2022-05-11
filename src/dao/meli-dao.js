'use strict'

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

const updateNotifiedPublications = function (publicationsToUpdate) {
    return meliDaoDb.updateNotifiedPublications(publicationsToUpdate)
}

exports.getCategories = getCategories;
exports.getPublicationsWithFilters = getPublicationsWithFilters;
exports.saveNotifiedPublication = saveNotifiedPublication;
exports.loadAlreadyNotifiedPublications = loadAlreadyNotifiedPublications;
exports.loadBlacklist = loadBlacklist;
exports.updateNotifiedPublications = updateNotifiedPublications