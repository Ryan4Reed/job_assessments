const { createNewTable, indexTable } = require("../utils/db_queries");

const setup = async () => {
  await createNewTable("sync_info");
  await createNewTable("jack_location_density");

  indexObject = [
    {
      table: "jack_location",
      indexes: ["sign_up_date", "full_location", "province"],
    },
    {
      table: "jack_location_density",
      indexes: [],
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
