const etlController = async (req, res) => {
  res.status(200).json({msg: 'ETL pipeline executed successfuly'});
};

module.exports = {
  etlController,
};
