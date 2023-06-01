const connectionPool = require("../setup/db_connect");

const extractMiddleware = async (req, res, next) => {
  try {
    const client = await connectionPool.connect();
    console.log("query started");

    res.locals.data = await client.query(
      "SELECT * FROM jack_location WHERE province = 'Gauteng';"
    );
    console.log("query complete");

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
};

module.exports = extractMiddleware;
