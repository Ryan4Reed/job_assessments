const {
  createNewTable,
  indexTable,
  parseCsvAndInsertData,
} = require("../utils/db_queries");

const setup = async () => {
  await createNewTable("sync_info");
  await createNewTable("cities");
  await createNewTable("provinces");
  await createNewTable("jack_location_density");

  await parseCsvAndInsertData("city", "cities");
  await parseCsvAndInsertData("province", "provinces");
  
  indexObject = [
    {
      table: "jack_location",
      indexes: ["sign_up_date", "full_location", "province"],
    },
    {
      table: "cities",
      indexes: ["city"],
    },
    {
      table: "provinces",
      indexes: ["province"],
    },
    {
      table: "jack_location_density",
      indexes: ["date_column", "city_id", "province_id"],
    },
  ];

  // add indexes
  for (const item of indexObject) {
    await indexTable(item.indexes, item.table);
  }
};

module.exports = {
  setup,
};
