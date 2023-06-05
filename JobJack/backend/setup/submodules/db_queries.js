const fs = require("fs");
const csv = require("csv-parser");
const connectionPool = require("../../setup/db_connect");
const {
  checkIfAlreadyParsed,
  parseSingleColumnCsvToTable,
} = require("../../utils/db_queries");

const parseCitiesProvincesData = async (tableName) => {
  console.log("Query to populate cities_provinces started");
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

  let batch = [];
  const batchSize = 1000; // Adjust as needed

  for await (const row of stream) {
    const cityName = row.city;
    const provinceName = row.province;
    const latitude = row.latitude; // retrieve latitude from row
    const longitude = row.longitude; // retrieve longitude from row

    const cityId = cityMap.get(cityName);
    const provinceId = provinceMap.get(provinceName);

    // Make sure we found both IDs
    if (!cityId || !provinceId) {
      console.log(
        `Could not find IDs for city ${cityName} and/or province ${provinceName}. Skipping.`
      );
      continue;
    }

    // Add record to batch
    batch.push([cityId, provinceId, latitude, longitude]);

    // If batch size reached, insert batch
    if (batch.length >= batchSize) {
      try {
        const insertValues = batch.map((row) => `(${row.join()})`).join();
        await connectionPool.query(
          `INSERT INTO cities_provinces (city_id, province_id, latitude, longitude) VALUES ${insertValues}`
        );
        batch = []; // Reset batch
      } catch (error) {
        console.log(
          `Error inserting batch into cities_provinces. Error: ${error}`
        );
      }
    }
  }

  // Insert any remaining records in the batch
  if (batch.length > 0) {
    try {
      const insertValues = batch.map((row) => `(${row.join()})`).join();
      await connectionPool.query(
        `INSERT INTO cities_provinces (city_id, province_id, latitude, longitude) VALUES ${insertValues}`
      );
    } catch (error) {
      console.log(
        `Error inserting final batch into cities_provinces. Error: ${error}`
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

module.exports = { parseCsvAndInsertData };
