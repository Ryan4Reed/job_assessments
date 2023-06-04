const rateLimit = require("express-rate-limit");

// Overall rate limiting
const overallLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 1, // start blocking after 1 requests
  message: "Too many requests from all users, please try again after an hour",
});

module.exports = {
  overallLimiter,
};
