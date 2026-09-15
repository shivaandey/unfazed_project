const Session = require('../models/Session');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const mongoose = require('mongoose');

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const therapistId = new mongoose.Types.ObjectId(req.user.id);

    const [sessionStats, paymentStats, revenueTrend, activeClientStats] = await Promise.all([
      Session.aggregate([
        { $match: { therapistId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Payment.aggregate([
        { $match: { therapistId, status: 'Completed' } },
        {
          $group: {
            _id: null,
            revenue: { $sum: { $ifNull: ['$net_amount', '$total_amount'] } },
            payments: { $sum: 1 }
          }
        }
      ]),
      Payment.aggregate([
        { $match: { therapistId, status: 'Completed' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: { $ifNull: ['$net_amount', '$total_amount'] } },
            payments: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Client.aggregate([
        { $match: { therapistId, status: 'Active' } },
        { $count: 'activeClients' }
      ])
    ]);

    const totalSessions = sessionStats.reduce((sum, item) => sum + item.count, 0);
    const scheduled = sessionStats.find((item) => item._id === 'Scheduled')?.count || 0;
    const completed = sessionStats.find((item) => item._id === 'Completed')?.count || 0;
    const cancelled = sessionStats.find((item) => item._id === 'Cancelled')?.count || 0;
    const waitlist = sessionStats.find((item) => item._id === 'Waitlist')?.count || 0;
    const noShows = sessionStats.find((item) => item._id === 'NoShow')?.count || 0;
    const noShowRate = totalSessions > 0 ? ((noShows / totalSessions) * 100).toFixed(2) : 0;

    const summary = {
      totalSessions,
      scheduled,
      completed,
      waitlist,
      cancelled,
      noShows,
      noShowRate: Number(noShowRate),
      activeClients: activeClientStats[0]?.activeClients || 0,
      revenue: paymentStats[0]?.revenue || 0,
      paymentCount: paymentStats[0]?.payments || 0,
      revenueTrend,
      sessionsByStatus: sessionStats.map((item) => ({ status: item._id, count: item.count }))
    };

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
