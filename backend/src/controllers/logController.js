const path = require('path');
const mongoose = require('mongoose');
const Log = require('../models/Log');
const AppError = require('../utils/AppError');
const {
  preprocessLogEntry,
  preprocessBatch,
  parseCSV,
  parsePlainTextLogs
} = require('../services/logPreprocessorService');

/**
 * POST /api/logs
 * Ingest a single security log entry
 */
const createLog = async (req, res, next) => {
  try {
    const rawData = req.body;
    const result = preprocessLogEntry(rawData, 1);

    if (!result.isValid) {
      return next(new AppError(`Log validation failed: ${result.reason}`, 400));
    }

    const newLog = await Log.create(result.data);

    res.status(201).json({
      success: true,
      message: 'Log entry ingested successfully',
      data: {
        log: newLog
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/logs/bulk
 * Ingest an array of JSON security log entries
 */
const createBulkLogs = async (req, res, next) => {
  try {
    const rawLogs = Array.isArray(req.body) ? req.body : req.body.logs;

    if (!Array.isArray(rawLogs) || rawLogs.length === 0) {
      return next(new AppError('Request body must be a non-empty array of log objects', 400));
    }

    const { accepted, rejected, totalReceived, acceptedCount, rejectedCount } = preprocessBatch(rawLogs);

    let insertedLogs = [];
    if (accepted.length > 0) {
      insertedLogs = await Log.insertMany(accepted, { ordered: false });
    }

    res.status(201).json({
      success: true,
      message: `Bulk log ingestion complete. Ingested ${insertedLogs.length} of ${totalReceived} records.`,
      data: {
        totalReceived,
        acceptedCount: insertedLogs.length,
        rejectedCount,
        rejections: rejected.slice(0, 100) // Truncate to first 100 rejections to prevent payload explosion
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/logs/upload
 * Upload and ingest security log files (CSV or .log plain text) via multipart/form-data
 */
const uploadLogs = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file provided. Please upload a .csv or .log file with key "file".', 400));
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const ext = path.extname(req.file.originalname).toLowerCase();

    let rawRows = [];
    if (ext === '.csv') {
      rawRows = parseCSV(fileContent);
    } else {
      // Handles .log, .txt, or plain text formats
      rawRows = parsePlainTextLogs(fileContent);
    }

    if (rawRows.length === 0) {
      return next(new AppError('The uploaded file contains no readable log records', 400));
    }

    const { accepted, rejected, totalReceived, acceptedCount, rejectedCount } = preprocessBatch(rawRows);

    let insertedLogs = [];
    if (accepted.length > 0) {
      insertedLogs = await Log.insertMany(accepted, { ordered: false });
    }

    res.status(201).json({
      success: true,
      message: `File processing complete. Successfully ingested ${insertedLogs.length} records.`,
      data: {
        filename: req.file.originalname,
        fileSize: req.file.size,
        totalReceived,
        acceptedCount: insertedLogs.length,
        rejectedCount,
        rejections: rejected.slice(0, 100)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/logs
 * Retrieve paginated security logs with multi-field filtering
 */
const getLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by eventType
    if (req.query.eventType) {
      filter.eventType = req.query.eventType.trim().toLowerCase();
    }

    // Filter by sourceIp (prefix match or exact)
    if (req.query.sourceIp) {
      filter.sourceIp = req.query.sourceIp.trim();
    }

    // Filter by username
    if (req.query.username) {
      filter.username = req.query.username.trim();
    }

    // Filter by anomaly status
    if (req.query.isAnomaly !== undefined) {
      filter.isAnomaly = req.query.isAnomaly === 'true';
    }

    // Filter by date range (startDate / endDate)
    if (req.query.startDate || req.query.endDate) {
      filter.timestamp = {};
      if (req.query.startDate) {
        const start = new Date(req.query.startDate);
        if (!isNaN(start.getTime())) {
          filter.timestamp.$gte = start;
        }
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        if (!isNaN(end.getTime())) {
          filter.timestamp.$lte = end;
        }
      }
    }

    const [logs, total] = await Promise.all([
      Log.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Log.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/logs/:id
 * Retrieve a single log by its MongoDB ObjectId
 */
const getLogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid log ID format', 400));
    }

    const log = await Log.findById(id).lean();
    if (!log) {
      return next(new AppError('Log entry not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        log
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/logs/stats
 * Aggregated summary statistics across ingested logs
 */
const getLogStats = async (req, res, next) => {
  try {
    const statsPipeline = [
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          anomalyCount: [{ $match: { isAnomaly: true } }, { $count: 'count' }],
          byEventType: [
            { $group: { _id: '$eventType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          uniqueIps: [{ $group: { _id: '$sourceIp' } }, { $count: 'count' }],
          uniqueUsers: [{ $group: { _id: '$username' } }, { $count: 'count' }],
          timeRange: [
            {
              $group: {
                _id: null,
                earliestTimestamp: { $min: '$timestamp' },
                latestTimestamp: { $max: '$timestamp' }
              }
            }
          ]
        }
      }
    ];

    const [result] = await Log.aggregate(statsPipeline);

    const totalLogs = result.totalCount[0] ? result.totalCount[0].count : 0;
    const totalAnomalies = result.anomalyCount[0] ? result.anomalyCount[0].count : 0;
    const uniqueIps = result.uniqueIps[0] ? result.uniqueIps[0].count : 0;
    const uniqueUsers = result.uniqueUsers[0] ? result.uniqueUsers[0].count : 0;
    const timeRange = result.timeRange[0] || { earliestTimestamp: null, latestTimestamp: null };

    const eventTypeDistribution = {};
    result.byEventType.forEach((item) => {
      eventTypeDistribution[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        totalAnomalies,
        anomalyRate: totalLogs > 0 ? Number(((totalAnomalies / totalLogs) * 100).toFixed(2)) : 0,
        uniqueIps,
        uniqueUsers,
        eventTypeDistribution,
        earliestTimestamp: timeRange.earliestTimestamp,
        latestTimestamp: timeRange.latestTimestamp
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/logs/:id
 * Delete a log entry (Admin only)
 */
const deleteLog = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid log ID format', 400));
    }

    const deleted = await Log.findByIdAndDelete(id);
    if (!deleted) {
      return next(new AppError('Log entry not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Log entry deleted successfully',
      data: {
        deletedId: id
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLog,
  createBulkLogs,
  uploadLogs,
  getLogs,
  getLogById,
  getLogStats,
  deleteLog
};
