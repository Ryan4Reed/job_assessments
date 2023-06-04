const { addNewSyncDate } = require("../utils/db_queries");
const { runUpdate } = require("./submodules/logic_jackD_populate");

const populateJackLDensityMiddleware = async (req, res, next) => {
  try {
    console.log("Query to populate jack_location_density started");
    await runUpdate();
    console.log("Query to populate jack_location_density completed");
    await addNewSyncDate();
  } catch (error) {
    console.log(
      `An error occurd while executing the query to populate jack_location_density: ${error.message}`
    );
    throw error;
  }
  next();
};

module.exports = populateJackLDensityMiddleware;
