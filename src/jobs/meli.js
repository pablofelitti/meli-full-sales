'use strict'

const meliService = require('../service/meli-service');

const retrieveCheapFullProducts = function() {
    meliService.retrieveCheapFullProducts()
}

exports.retrieveCheapFullProducts = retrieveCheapFullProducts