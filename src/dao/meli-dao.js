'use strict'

const meliRestDao = require('./meli-dao-rest');
const meliDaoDb = require('./meli-dao-db');

const getConnection = function() {
    return meliDaoDb.getConnection()
}

const getCategories = function () {
    return meliRestDao.getCategories();
}

const getPublicationsWithFilters = function (category, client) {
    return meliRestDao.getPublicationsWithFilters(category, client);
}

const saveNotifiedPublication = async function (publications, client) {
    return meliDaoDb.saveNotifiedPublication(publications, client);
}

const loadAlreadyNotifiedPublications = function (publicationIds, client) {
    return meliDaoDb.loadAlreadyNotifiedPublications(publicationIds, client);
}

const loadBlacklist = function (client) {
    return meliDaoDb.loadBlacklist(client)
};

const updateNotifiedPublications = function (publicationsToUpdate, client) {
    return meliDaoDb.updateNotifiedPublications(publicationsToUpdate, client)
}

exports.getCategories = getCategories;
exports.getPublicationsWithFilters = getPublicationsWithFilters;
exports.saveNotifiedPublication = saveNotifiedPublication;
exports.loadAlreadyNotifiedPublications = loadAlreadyNotifiedPublications;
exports.loadBlacklist = loadBlacklist;
exports.updateNotifiedPublications = updateNotifiedPublications
exports.getConnection = getConnection