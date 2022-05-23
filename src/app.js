const meliService = require('./meli-service');

exports.lambdaHandler = async (event, context) => {
    await meliService.retrieveCheapFullProducts()
}