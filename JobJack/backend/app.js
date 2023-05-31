const express = require("express");
const app = express();
const { port } = require("./config/environment");
const etlRoutes = require("./routes/routes");

// Mount routes
app.use("/", etlRoutes);

app.listen(port, () => {
  console.log(`server listening on port ${port}...`);
});
