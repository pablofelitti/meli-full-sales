'use strict'

const meliService = require('../service/meli-service');

const retrieveCheapFullProducts = async function() {
    await meliService.retrieveCheapFullProducts()
}

exports.retrieveCheapFullProducts = retrieveCheapFullProducts