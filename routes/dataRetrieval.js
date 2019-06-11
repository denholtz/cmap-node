const router = require('express').Router();
const dataRetrievalController = require('../controllers/dataRetrieval');

const asyncControllerWrapper = require('../errorHandling/asyncControllerWrapper');

// Custom query statement route
router.get('/query', asyncControllerWrapper(dataRetrievalController.customQuery));

// Stored procedure route
router.get('/sp', asyncControllerWrapper(dataRetrievalController.storedProcedure));

module.exports = router;