const connectionPool = require("../setup/db_connect");
const fs = require("fs");
const csv = require("csv-parser");

const fetchLastSyncDate = async () => {
  const syncInfoRes = await connectionPool.query(
    "SELECT MAX(last_sync_date) FROM sync_info"
  );
  let lastSyncDate = syncInfoRes.rows[0].max;

  // If lastSyncDate is null, set it to '2000-01-01'
  if (!lastSyncDate) {
    lastSyncDate = "2000-01-01";
  }
  return lastSyncDate;
};

const fetchChunk = async (lastSyncDate, limit, offset) => {
  const jackLocationRes = await connectionPool.query(
    `SELECT * FROM jack_location
       WHERE CAST(sign_up_date AS TIMESTAMP) > $1
       AND (city IS NULL OR province IS NULL)
       ORDER BY CAST(sign_up_date AS TIMESTAMP)
       LIMIT $2 OFFSET $3`,
    [lastSyncDate, limit, offset]
  );
  const jackLocationRows = jackLocationRes.rows;

  return jackLocationRows;
};

const fetchCityProvinceCombinations = async () => {
  const citiesRes = await connectionPool.query(
    `SELECT c.city, p.province
     FROM cities c
     JOIN cities_provinces cp ON cp.city_id = c.id
     JOIN provinces p ON cp.province_id = p.id`
  );
  const cities = citiesRes.rows.reduce((obj, row) => {
    const city = row.city.toLowerCase();
    const province = row.province.toLowerCase();
    if (!obj[city]) {
      obj[city] = [];
    }
    obj[city].push(province);
    return obj;
  }, {});
  return cities;
};

const splitTrimLowerCase = (row) => {
  const fullLocationParts = row.full_location
    .split(", ")
    .map((part) => part.trim().toLowerCase());
  return fullLocationParts;
};

const getProvinces = async () => {
  const exempted = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream("./data/provinces.csv")
      .pipe(csv())
      .on("data", (data) => {
        exempted.push(data.province.toLowerCase());
      })
      .on("end", () => {
        resolve();
      })
      .on("error", (error) => {
        reject(error);
      });
  });

  return exempted;
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
          const newCity = provinces.length === 1 ? part : row.city;
          const newProvince =
            row.province === null ? provinces[0] : row.province;

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

const updateTable = async (updateData) => {
  if (updateData.length > 0) {
    console.log(updateData);

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
              SET city = COALESCE(vals.city, jack_location.city), 
                  province = COALESCE(vals.province, jack_location.province)
              FROM vals
              WHERE jack_location.id = vals.id;
              `;

    // Execute the query
    await connectionPool.query(queryString);
  }
};

const extractMiddleware = async (req, res, next) => {
  try {
    console.log(
      "Query to populate the city and province columns in jack_location started"
    );

    const exempted = await getProvinces();
    exempted.push("south africa");

    try {
      const lastSyncDate = await fetchLastSyncDate();
      let offset = 0;
      const limit = 10000; // Adjust this number as desired

      while (true) {
        try {
          // Fetch a chunk of rows from jack_location
          const jackLocationRows = await fetchChunk(
            lastSyncDate,
            limit,
            offset
          );
          let updateData = [];

          const citiesToProvinces = await fetchCityProvinceCombinations();

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

          // Batch update using prepared statement
          await updateTable(updateData);

          offset += limit; // Move to the next chunk
        } catch (err) {
          console.error(err);
        }
      }
    } catch (err) {
      console.error(err);
    }

    next();
  } catch (error) {
    xc;
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = extractMiddleware;
