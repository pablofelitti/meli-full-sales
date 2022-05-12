const meli = require("./jobs/meli")

exports.lambdaHandler = async (event, context) => {
    await meli.retrieveCheapFullProducts()
}