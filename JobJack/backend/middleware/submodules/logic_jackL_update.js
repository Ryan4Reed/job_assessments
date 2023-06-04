const connectionPool = require("../../setup/db_connect");
const fs = require("fs");
const csv = require("csv-parser");

const fetchChunk = async (lastSyncDate, limit, offset) => {
  try {
    const jackLocationRes = await connectionPool.query(
      `SELECT * FROM jack_location
         WHERE CAST(sign_up_date AS TIMESTAMP) > $1
         AND (city IS NULL OR province IS NULL)
         ORDER BY CAST(sign_up_date AS TIMESTAMP)
         LIMIT $2 OFFSET $3`,
      [lastSyncDate, limit, offset]
    );
    const jackLocationRows = jackLocationRes.rows;

    console.log(`Successfully fetched chunk for offset: ${offset}`);

    return jackLocationRows;
  } catch (error) {
    console.log(
      `An error occured while fetchin a chunk of data: ${error.message}`
    );
    throw error;
  }
};

const getProvinces = async () => {
  try {
    const exempted = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream("./data/provinces.csv")
        .pipe(csv())
        .on("data", (data) => {
          exempted.push(data.province.toLowerCase());
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log("Successfully fetched provinces.csv");

    return exempted;
  } catch (error) {
    console.error(
      `An error occurred while reading provinces.csv: ${error.message}`
    );
    throw error;
  }
};

const splitTrimLowerCase = (row) => {
  const fullLocationParts = row.full_location
    .split(", ")
    .map((part) => part.trim().toLowerCase());
  return fullLocationParts;
};

const identifyCityProvinceToAdd = async (
  row,
  citiesToProvinces,
  exempted,
  updateData
) => {
  const fullLocationParts = splitTrimLowerCase(row);
  for (let part of fullLocationParts) {
    // if part does not contain digits are an exempted string
    if (!/\d/.test(part) && !exempted.includes(part)) {
      const provinces = citiesToProvinces[part];
      if (provinces) {
        const rowProvince = row.province ? row.province.toLowerCase() : null;
        if (
          provinces.includes(rowProvince) ||
          (provinces.length === 1 && rowProvince === null)
        ) {
          const newCity = row.city === null ? part : row.city;
          const newProvince = rowProvince === null ? provinces[0] : rowProvince;

          updateData.push({
            city: newCity,
            province: newProvince,
            id: row.id,
          });
        }
      }
    }
  }
  return updateData;
};

const updateJackLocationTable = async (updateData) => {
  try {
    if (updateData.length > 0) {
      // Generate valuesStrs considering null values
      const valuesStrs = updateData.map(
        (d) =>
          `(${d.city ? `'${d.city.replace(/'/g, "''")}'` : "NULL"}, ${
            d.province ? `'${d.province.replace(/'/g, "''")}'` : "NULL"
          }, ${d.id})`
      );

      // Construct a single string where each set of values is separated by a comma
      const valuesStr = valuesStrs.join(", ");

      // Construct the query string
      const queryString = `
                WITH vals (city, province, id) AS (
                    VALUES ${valuesStr}
                )
                UPDATE jack_location
                SET city = COALESCE(jack_location.city, vals.city), 
                    province = COALESCE(jack_location.province, vals.province)
                FROM vals
                WHERE jack_location.id = vals.id;
                `;

      // Execute the query
      await connectionPool.query(queryString);
      console.log("Successfully updated jack_location for current chunk");
    }
  } catch (error) {
    console.log(
      `An error occured while updating jack_location table: ${error.message}`
    );
    throw error;
  }
};

module.exports = {
  fetchChunk,
  getProvinces,
  identifyCityProvinceToAdd,
  updateJackLocationTable,
};
