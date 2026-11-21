const axios = require('axios');
const config = require('../config/env');
const AppError = require('../utils/AppError');

const client = axios.create({
  baseURL: config.mlServiceUrl,
  timeout: 30000, // 30s timeout for batch processing
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': config.mlApiKey
  }
});

const checkHealth = async () => {
  try {
    const response = await client.get('/health');
    return response.data;
  } catch (error) {
    throw new AppError(
      `ML Microservice unreachable: ${error.response ? error.response.data.detail || error.message : error.message}`,
      503
    );
  }
};

const getModelInfo = async () => {
  try {
    const response = await client.get('/model/info');
    return response.data;
  } catch (error) {
    throw new AppError(
      `ML Model Info Error: ${error.response ? error.response.data.detail || error.message : error.message}`,
      error.response ? error.response.status : 500
    );
  }
};

const trainModel = async (logs, contamination = null) => {
  try {
    const payload = { logs };
    if (contamination !== null && contamination !== undefined) {
      payload.contamination = contamination;
    }
    const response = await client.post('/train', payload);
    return response.data;
  } catch (error) {
    throw new AppError(
      `ML Training Failed: ${error.response ? error.response.data.detail || error.message : error.message}`,
      error.response ? error.response.status : 500
    );
  }
};

const predictLogs = async (logs) => {
  try {
    const response = await client.post('/predict', { logs });
    return response.data;
  } catch (error) {
    throw new AppError(
      `ML Inference Failed: ${error.response ? error.response.data.detail || error.message : error.message}`,
      error.response ? error.response.status : 500
    );
  }
};

module.exports = {
  checkHealth,
  getModelInfo,
  trainModel,
  predictLogs
};
