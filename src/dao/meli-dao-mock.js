'use strict'

const fs = require('fs');
const path = require("path");
const categoriesJsonPath = path.resolve('src/local-tests/categories/categories.json');
const mla3937 = path.resolve('src/local-tests/publications/MLA3937.json');
const mla1499 = path.resolve('src/local-tests/publications/MLA1499.json');
const mla5726 = path.resolve('src/local-tests/publications/MLA5726.json');

const publicationsByCategory = new Map();
publicationsByCategory.set('MLA3937', mla3937);
publicationsByCategory.set('MLA1499', mla1499);
publicationsByCategory.set('MLA5726', mla5726);

const getCategories = function () {
    return new Promise((resolve) => {
        let categories;
        fs.readFile(categoriesJsonPath, 'utf8', function (err, data) {
            if (err) throw err;
            categories = JSON.parse(data);
            resolve(categories);
        });
    });
}

const getPublicationsWithFilters = function (category) {
    return new Promise((resolve) => {
        let publications;
        fs.readFile(publicationsByCategory.get(category.id), 'utf8', function (err, data) {
            if (err) throw err;
            publications = JSON.parse(data);
            resolve(publications.results);
        });
    });
}

const loadAlreadyNotifiedPublications = function (publicationIds) {
    return new Promise(resolve => {
        resolve([{id: 'MLA814757059'}])
    })
}

const loadBlacklist = function () {
    return new Promise(resolve => {
        resolve([{id: 'MLA749158328', title: 'Mercado Pago Kit Point Mpos + Código Qr'}])
    })
}

exports.getCategories = getCategories
exports.getPublicationsWithFilters = getPublicationsWithFilters
exports.loadAlreadyNotifiedPublications = loadAlreadyNotifiedPublications
exports.loadBlacklist = loadBlacklist