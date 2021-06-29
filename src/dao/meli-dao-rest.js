'use strict'

const https = require('https');
const priceLimit = 700

const getCategories = function () {

    const options = {
        hostname: 'api.mercadolibre.com',
        port: 443,
        path: '/sites/MLA/categories',
        method: 'GET'
    }

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {

            res.on('data', d => {
                const jsonData = JSON.parse(d);
                let categories = [];
                jsonData.forEach(it => categories.push(it.id));
                resolve(categories)
            })
        })

        req.on('error', error => {
            reject(error)
        })

        req.end()
    })
}

const getPublicationsWithFilters = function (category) {

//TODO query params should be treated as parameters somewhere else
    const options = {
        hostname: 'api.mercadolibre.com',
        port: 443,
        path: '/sites/MLA/search?category=' + category + '&shipping_cost=free&shipping=fulfillment&price=0-' + priceLimit + '&limit=10',
        method: 'GET'
    }

    return new Promise((resolve, reject) => {
        const req = https.request(options, res => {

            let chunks = [];

            res.on('data', function (data) {
                chunks.push(data);
            }).on('end', function () {

                let data = Buffer.concat(chunks);

                const jsonData = JSON.parse(data);
                let publications = [];
                jsonData.results
                    .filter(it => it.price <= priceLimit)
                    .forEach(it => publications.push(it));

                console.log('For category ' + category + ' ' + publications.length + ' products were found');

                resolve(publications)
            })
        })

        req.on('error', error => {
            reject(error)
        })

        req.end()
    })
}

exports.getCategories = getCategories;
exports.getPublicationsWithFilters = getPublicationsWithFilters;