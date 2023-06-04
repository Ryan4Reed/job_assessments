const {
  createNewTable,
  indexTable,
  addPrimaryIdColumn,
} = require("../utils/db_queries");
const {parseCsvAndInsertData} = require('./submodules/db_queries')

const setup = async () => {
  await addPrimaryIdColumn("jack_location");
  await createNewTable("sync_info");
  await createNewTable("cities");
  await createNewTable("provinces");
  await createNewTable("cities_provinces");
  await createNewTable("jack_location_density");

  await parseCsvAndInsertData("city", "cities");
  await parseCsvAndInsertData("province", "provinces");
  await parseCsvAndInsertData(["city", "province"], "cities_provinces");

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

  for (const item of indexObject) {
    await indexTable(item.indexes, item.table);
  }
};

module.exports = {
  setup,
};
