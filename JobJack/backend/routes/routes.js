const express = require("express");
const router = express.Router();
const { etlController } = require("../controllers/tasks");
const updateJackLocationMiddleware = require("../middleware/update_jack_location");
const populateJackLDensityMiddleware = require('../middleware/populate_jack_density')

router
  .route("/etl")
  .post(
    updateJackLocationMiddleware,
    populateJackLDensityMiddleware,
    etlController
  );

module.exports = router;
