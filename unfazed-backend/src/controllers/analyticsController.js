const Session = require('../models/Session');
const Payment = require('../models/Payment');

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const therapistId = req.user.id;

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
            revenue: { $sum: '$net_amount' },
            payments: { $sum: 1 }
          }
        }
      ]),
      Payment.aggregate([
        { $match: { therapistId, status: 'Completed' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: '$net_amount' },
            payments: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Session.aggregate([
        { $match: { therapistId } },
        { $group: { _id: '$clientEmail', count: { $sum: 1 } } },
        { $count: 'activeClients' }
      ])
    ]);

    const totalSessions = sessionStats.reduce((sum, item) => sum + item.count, 0);
    const scheduled = sessionStats.find((item) => item._id === 'Scheduled')?.count || 0;
    const completed = sessionStats.find((item) => item._id === 'Completed')?.count || 0;
    const cancelled = sessionStats.find((item) => item._id === 'Cancelled')?.count || 0;
    const waitlist = sessionStats.find((item) => item._id === 'Waitlist')?.count || 0;
    const noShowRate = totalSessions > 0 ? ((cancelled / totalSessions) * 100).toFixed(2) : 0;

    const summary = {
      totalSessions,
      scheduled,
      completed,
      waitlist,
      cancelled,
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
