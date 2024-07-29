'use strict'

const AWS = require('aws-sdk')
AWS.config.update({region: 'us-east-1'});
const ddb = new AWS.DynamoDB({apiVersion: "2012-08-10"});

//TODO remove duplicate
function unifyId(id) {
    let noPrefixId = id.replace('MLA', '');
    return parseInt(noPrefixId);
}

const saveNotifiedPublication = async function (publications, t) {

    let params = {
        RequestItems: {
            meli_notified_publications: [],
        },
    };

    publications.forEach(it => {
        params.RequestItems.meli_notified_publications.push({
            PutRequest: {
                Item: {
                    id: {N: unifyId(it.id).toString()},
                    title: {S: it.title},
                    price: {S: it.price.toString()},
                    notified_date: {S: t.toString()}
                },
            },
        })
    })

    await ddb.batchWriteItem(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success", data);
        }
    }).promise();

}

const updateNotifiedPublications = async function updateNotifiedPublications(publicationsToUpdate) {
    let ids = publicationsToUpdate.map(it => it.id)
    let notifiedDate = publicationsToUpdate[0].notified_date
    //await client.query('update notified_publications set notified_date=? where id in (' + '\'' + ids.join('\', \'') + '\'' + ')', [notifiedDate])

    for (let i = 0; i < ids.length; i++) {
        let params = {
            TableName: "meli_notified_publications",
            Key: {
                id: {
                    'N': ids[i]
                }
            },
            UpdateExpression: "SET notified_date = :nd",
            ExpressionAttributeValues: {
                ':nd': {
                    'S': notifiedDate
                },
            }
        };

        await ddb.updateItem(params, function (err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success", data);
            }
        }).promise();
    }
}

const loadAlreadyNotifiedPublications = async function (publicationIds) {
    let params = {
        RequestItems: {
            meli_notified_publications: {
                Keys: [],
                ProjectionExpression: "id, title, price, notified_date",
            },
        },
    };

    publicationIds.forEach(function (e, i, a) {
        params.RequestItems.meli_notified_publications.Keys.push({id: {N: e.toString()}})
    })

    let res = []
    await ddb.batchGetItem(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            data.Responses.meli_notified_publications.forEach(function (element, index, array) {
                res.push({
                    id: parseInt(element.id.N),
                    notified_date: element.notified_date.S
                });
            });
        }
    }).promise();

    return res;
}

const loadBlacklist = async function () {

    const params = {
        ProjectionExpression: "id, title",
        TableName: "meli_blacklist",
    };

    let res = []
    await ddb.scan(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success reading blacklist");
            data.Items.forEach(function (element, index, array) {
                res.push({
                    id: element.id.N,
                    title: element.title.S,
                })
            });
        }
    }).promise();

    return res
}

exports.saveNotifiedPublication = saveNotifiedPublication
exports.loadAlreadyNotifiedPublications = loadAlreadyNotifiedPublications
exports.loadBlacklist = loadBlacklist
exports.updateNotifiedPublications = updateNotifiedPublications
