const healthService = require('../services/healthService');

const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    data: healthService.getHealth()
  });
};

const getStatus = (req, res) => {
  res.status(200).json({
    success: true,
    data: healthService.getStatus()
  });
};

module.exports = {
  getHealth,
  getStatus
};
