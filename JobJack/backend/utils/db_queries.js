const connectionPool = require("../setup/db_connect");

const createNewTable = async (tableName) => {
  const tableExists = await checkTableExists(tableName);
  if (!tableExists) {
    // await createNewTable();
    console.log(`Table ${tableName} created successfully.`);
  }
};

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

const indexTable = async (indexesToAdd, existingTable) => {
  for (const indx of indexesToAdd) {
    const indexExists = await checkIndexExists(indx, existingTable);
    if (!indexExists) {
      await addIndexToTable(indx, existingTable);
    }
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

module.exports = {
  createNewTable,
  indexTable,
};
