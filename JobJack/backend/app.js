const express = require("express");
const { port } = require("./config/environment");
const etlRoutes = require("./routes/routes");
const { setup } = require("./setup/setup");

(async () => {
  try {
    // Perform setup tasks
    await setup();

    // Create Express app
    const app = express();

    // Mount routes
    app.use("/", etlRoutes);

    // Start the server
    app.listen(port, () => {
      console.log(`Server listening on port ${port}...`);
    });
  } catch (error) {
    console.error("Error setting up the application:", error);
    // Handle the error appropriately
  }
})();
