const connectionPool = require("../setup/db_connect");
const fs = require("fs");
const csv = require("csv-parser");

const checkTableExists = async (table) => {
  try {
    if (table === undefined) {
      throw new Error("Missing required parameter: table");
    }
    const client = await connectionPool.connect();
    const result = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = '${table}'
      )
    `);
    client.release();
    return result.rows[0].exists;
  } catch (error) {
    console.error("Error checking table existence:", error);
    throw error;
  }
};

const createNewTable = async (tableName) => {
  const tableExists = await checkTableExists(tableName);
  if (!tableExists) {
    console.log(tableName);

    const sql = fs
      .readFileSync(`./setup/db_table_schemas/${tableName}.sql`)
      .toString();

    // Connect to your database
    connectionPool.connect((err, client, done) => {
      if (err) {
        console.error("Error acquiring client", err.stack);
        throw err;
      }
      // Execute the SQL file
      client.query(sql, (err, res) => {
        done();
        if (err) {
          console.log(err.stack);
          throw err;
        } else {
          console.log(`Table ${tableName} created.`);
        }
      });
    });
  }
};

const checkIndexExists = async (indexName, tableName) => {
  try {
    const client = await connectionPool.connect();
    const query = `
        SELECT EXISTS (
          SELECT 1
          FROM pg_indexes
          WHERE tablename = '${tableName}'
          AND indexname = 'idx_${indexName}'
        );
      `;
    const result = await client.query(query);
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

    const client = await connectionPool.connect();
    const indexName = `idx_${columnName}`;
    const query = `CREATE INDEX ${indexName} ON ${tableName} (${columnName});`;
    await client.query(query);
    console.log(`Index ${indexName} created successfully.`);

    client.release();
    return;
  } catch (error) {
    console.error("Error checking table existence:", error);
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
  connectionPool.query(
    `SELECT EXISTS (SELECT 1 FROM ${tableName})`,
    (error, results) => {
      if (error) {
        throw error;
      }
      return results.rows[0].exists;
    }
  );
};

const parseCsvToTable = async (columnName, tableName) => {
  fs.createReadStream(`./data/${tableName}.csv`)
    .pipe(csv())
    .on("data", (row) => {
      connectionPool.query(
        `INSERT INTO ${tableName} (${columnName}) VALUES ($1)`,
        [row.city],
        (error, results) => {
          if (error) {
            throw error;
          }
        }
      );
    })
    .on("end", () => {
      console.log("CSV file successfully processed");
    });
};

const parseCsvAndInsertData = async (columnName, tableName) => {
  const exists = checkIfAlreadyParsed(tableName);
  if (!exists) {
    parseCsvToTable(columnName, tableName);
  }
};

module.exports = {
  createNewTable,
  indexTable,
  parseCsvAndInsertData,
};
