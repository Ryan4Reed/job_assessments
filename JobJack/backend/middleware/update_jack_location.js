const {
  fetchChunk,
  getProvinces,
  identifyCityProvinceToAdd,
  updateJackLocationTable,
} = require("./submodules/logic_jackL_update");
const {
  fetchLastSyncDate,
  fetchCityProvinceCombinations,
} = require("../utils/db_queries");

const updateJackLocationMiddleware = async (req, res, next) => {
  try {
    console.log(
      "Query to populate the city and province columns in jack_location started"
    );

    const exempted = await getProvinces();
    exempted.push("south africa");

    const lastSyncDate = await fetchLastSyncDate();
    let offset = 0;
    const limit = 10000; // adjustable

    const citiesToProvinces = await fetchCityProvinceCombinations();

    while (true) {
      // Fetch a chunk of rows from jack_location
      const jackLocationRows = await fetchChunk(lastSyncDate, limit, offset);
      let updateData = [];

      for (let row of jackLocationRows) {
        if (row.full_location) {
          updateData = await identifyCityProvinceToAdd(
            row,
            citiesToProvinces,
            exempted,
            updateData
          );
        }
      }
      await updateJackLocationTable(updateData);

      // If true, exit the loop
      if (jackLocationRows.length < limit) {
        break;
      }
      offset += limit; // Move to the next chunk
    }
    console.log(
      "Query to populate the city and province columns in jack_location completed"
    );
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = updateJackLocationMiddleware;
