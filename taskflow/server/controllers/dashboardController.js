const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// GET /api/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const taskFilter = req.user.role === 'member' ? { assignedTo: req.user._id } : {};
    const now = new Date();

    const [total, completed, inProgress, pending, overdue, projects, recentTasks] =
      await Promise.all([
        Task.countDocuments(taskFilter),
        Task.countDocuments({ ...taskFilter, status: 'completed' }),
        Task.countDocuments({ ...taskFilter, status: 'in_progress' }),
        Task.countDocuments({ ...taskFilter, status: 'pending' }),
        Task.countDocuments({
          ...taskFilter,
          deadline: { $lt: now },
          status: { $ne: 'completed' },
        }),
        req.user.role === 'admin'
          ? Project.countDocuments()
          : Project.countDocuments({
              $or: [{ owner: req.user._id }, { members: req.user._id }],
            }),
        Task.find(taskFilter)
          .sort('-createdAt')
          .limit(5)
          .populate('assignedTo', 'name')
          .populate('project', 'title color'),
      ]);

    let memberCount = 0;
    if (req.user.role === 'admin') {
      memberCount = await User.countDocuments({ role: 'member' });
    }

    res.json({
      stats: { total, completed, inProgress, pending, overdue, projects, memberCount },
      recentTasks,
    });
  } catch (err) {
    next(err);
  }
};
