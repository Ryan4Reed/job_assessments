const connectionPool = require("../setup/db_connect");
const fs = require("fs");
const csv = require("csv-parser");

const checkTableExists = async (table) => {
  try {
    if (table === undefined) {
      throw new Error("Missing required parameter: table");
    }

    const query = `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = $1
      )
    `;
    const params = [table];

    const result = await connectionPool.query(query, params);
    return result.rows[0].exists;
  } catch (error) {
    console.error("Error checking table existence:", error);
    throw error;
  }
};

const createNewTable = async (tableName) => {
  const tableExists = await checkTableExists(tableName);
  if (!tableExists) {
    const sql = fs
      .readFileSync(`./setup/db_table_schemas/${tableName}.sql`)
      .toString();

    try {
      await connectionPool.query(sql);
      console.log(`Table ${tableName} created.`);
    } catch (err) {
      console.error("Error creating table", err.stack);
      throw err;
    }
  }
};

const checkIndexExists = async (indexName, tableName) => {
  try {
    const query = `
        SELECT EXISTS (
          SELECT 1
          FROM pg_indexes
          WHERE tablename = $1
          AND indexname = $2
        );
      `;
    const params = [tableName, `idx_${tableName}_${indexName}`];
    const result = await connectionPool.query(query, params);
    const exists = result.rows[0].exists;
    return exists;
  } catch (error) {
    console.error("Error checking index existence:", error);
    throw error;
  }
};

const addIndexToTable = async (columnName, tableName) => {
  try {
    if (tableName === undefined || columnName === undefined) {
      throw new Error("Missing required parameters");
    }

    const indexName = `idx_${tableName}_${columnName}`;
    const query = `CREATE INDEX ${indexName} ON ${tableName} (${columnName})`;
    await connectionPool.query(query);
    console.log(`Index ${indexName} created successfully.`);
  } catch (error) {
    console.error("Error adding index to table:", error);
    throw error;
  }
};

const indexTable = async (indexesToAdd, existingTable) => {
  for (const indx of indexesToAdd) {
    const indexExists = await checkIndexExists(indx, existingTable);
    if (!indexExists) {
      await addIndexToTable(indx, existingTable);
    }
  }
};

const checkIfAlreadyParsed = async (tableName) => {
  try {
    query = `SELECT EXISTS (SELECT 1 FROM ${tableName})`;
    const result = await connectionPool.query(query);
    return result.rows[0].exists;
  } catch (error) {
    throw error;
  }
};

const parseSingleColumnCsvToTable = async (columnName, tableName) => {
  const stream = fs.createReadStream(`./data/${tableName}.csv`).pipe(csv());

  for await (const row of stream) {
    const query = `INSERT INTO ${tableName} (${columnName}) VALUES ($1)`;
    const params = [row[columnName]];

    try {
      await connectionPool.query(query, params);
    } catch (error) {
      console.error(`Error inserting data into ${tableName}. Error: ${error}`);
      throw error;
    }
  }

  console.log(`CSV file successfully processed for ${tableName}`);
};

const parseCitiesProvincesData = async (tableName) => {
  // This function assumes that the CSV header correlates perfectly to the table column names
  const stream = fs.createReadStream(`./data/${tableName}.csv`).pipe(csv());

  // Fetch all existing city and province records
  const cities = await connectionPool.query("SELECT id, city FROM cities");
  const provinces = await connectionPool.query(
    "SELECT id, province FROM provinces"
  );

  const cityMap = new Map(cities.rows.map((row) => [row.city, row.id]));
  const provinceMap = new Map(
    provinces.rows.map((row) => [row.province, row.id])
  );

  for await (const row of stream) {
    const cityName = row.city;
    const provinceName = row.province;

    const cityId = cityMap.get(cityName);
    const provinceId = provinceMap.get(provinceName);

    // Make sure we found both IDs
    if (!cityId || !provinceId) {
      console.log(
        `Could not find IDs for city ${cityName} and/or province ${provinceName}. Skipping.`
      );
      continue;
    }

    // Insert the city-province combination into the cities_provinces table
    try {
      await connectionPool.query(
        "INSERT INTO cities_provinces (city_id, province_id) VALUES ($1, $2)",
        [cityId, provinceId]
      );
    } catch (error) {
      console.log(
        `Error inserting ${cityName} and ${provinceName} into cities_provinces. Error: ${error}`
      );
    }
  }

  console.log("Successfully written csv data to cities_provinces table.");
};

const parseCsvAndInsertData = async (columnName, tableName) => {
  const exists = await checkIfAlreadyParsed(tableName);

  if (!exists && tableName === "cities_provinces") {
    await parseCitiesProvincesData(tableName);
  } else if (!exists) {
    await parseSingleColumnCsvToTable(columnName, tableName);
  }
};

module.exports = {
  createNewTable,
  indexTable,
  parseCsvAndInsertData,
};
