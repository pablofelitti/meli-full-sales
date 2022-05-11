const meli = require("./jobs/meli")
const AWS = require('aws-sdk')
const ssm = new AWS.SSM();

exports.lambdaHandler = async (event, context) => {
    await meli.retrieveCheapFullProducts()
}