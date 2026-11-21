const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const AppError = require('../utils/AppError');

/**
 * GET /api/alerts
 * Paginated and filtered query of alerts
 */
const getAlerts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.severity) {
      filter.severity = req.query.severity.trim().toLowerCase();
    }

    if (req.query.status) {
      filter.status = req.query.status.trim().toLowerCase();
    }

    if (req.query.sourceIp) {
      filter.sourceIp = req.query.sourceIp.trim();
    }

    if (req.query.username) {
      filter.username = req.query.username.trim();
    }

    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        const start = new Date(req.query.startDate);
        if (!isNaN(start.getTime())) filter.createdAt.$gte = start;
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        if (!isNaN(end.getTime())) filter.createdAt.$lte = end;
      }
    }

    const [alerts, total] = await Promise.all([
      Alert.find(filter)
        .populate('logId')
        .populate('resolvedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Alert.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        alerts,
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
 * GET /api/alerts/:id
 * Retrieve a single alert by ID
 */
const getAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid alert ID format', 400));
    }

    const alert = await Alert.findById(id)
      .populate('logId')
      .populate('resolvedBy', 'name email role')
      .lean();

    if (!alert) {
      return next(new AppError('Alert not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        alert
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/alerts/:id/status
 * Update alert triage status (acknowledged, resolved)
 */
const updateAlertStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid alert ID format', 400));
    }

    if (!['acknowledged', 'resolved', 'open'].includes(status)) {
      return next(new AppError("Invalid status. Allowed: 'open', 'acknowledged', 'resolved'", 400));
    }

    const updateFields = { status };
    if (status === 'resolved') {
      updateFields.resolvedBy = req.user._id;
      updateFields.resolvedAt = new Date();
    } else if (status === 'open') {
      updateFields.resolvedBy = null;
      updateFields.resolvedAt = null;
    }

    const updatedAlert = await Alert.findByIdAndUpdate(id, { $set: updateFields }, { new: true })
      .populate('logId')
      .populate('resolvedBy', 'name email role');

    if (!updatedAlert) {
      return next(new AppError('Alert not found', 404));
    }

    res.status(200).json({
      success: true,
      message: `Alert status updated to '${status}'`,
      data: {
        alert: updatedAlert
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/alerts/stats
 * Aggregated alert metrics and severity breakdown
 */
const getAlertStats = async (req, res, next) => {
  try {
    const [stats] = await Alert.aggregate([
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          bySeverity: [
            { $group: { _id: '$severity', count: { $sum: 1 } } }
          ],
          recentLast24h: [
            {
              $match: {
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
              }
            },
            { $count: 'count' }
          ],
          avgScore: [
            { $group: { _id: null, avgScore: { $avg: '$anomalyScore' } } }
          ]
        }
      }
    ]);

    const totalAlerts = stats.totalCount[0] ? stats.totalCount[0].count : 0;
    const last24hCount = stats.recentLast24h[0] ? stats.recentLast24h[0].count : 0;
    const averageAnomalyScore = stats.avgScore[0] ? Number(stats.avgScore[0].avgScore.toFixed(4)) : 0;

    const statusCounts = { open: 0, acknowledged: 0, resolved: 0 };
    stats.byStatus.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    stats.bySeverity.forEach((item) => {
      severityCounts[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalAlerts,
        openAlerts: statusCounts.open,
        acknowledgedAlerts: statusCounts.acknowledged,
        resolvedAlerts: statusCounts.resolved,
        last24hCount,
        averageAnomalyScore,
        severityBreakdown: severityCounts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlerts,
  getAlertById,
  updateAlertStatus,
  getAlertStats
};
