const express = require("express");
const router = express.Router();
const { etlController } = require("../controllers/tasks");
const extractMiddleware = require("../middleware/extract");

router.route("/etl").post(extractMiddleware, etlController);

module.exports = router;
