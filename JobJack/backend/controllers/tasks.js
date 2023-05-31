const etlController = async (req, res) => {
  res.status(200).json(res.locals.data.rows);
};

module.exports = {
  etlController,
};
