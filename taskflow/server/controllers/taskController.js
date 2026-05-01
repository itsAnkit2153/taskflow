const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

// GET /api/tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { project, status, assignedTo, search, priority } = req.query;
    const filter = {};

    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }
    if (project) filter.project = project;
    if (status) filter.status = status;
    if (assignedTo && req.user.role === 'admin') filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'title color')
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, status, priority, deadline, assignedTo, project, tags } = req.body;

    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create({
      title, description, status, priority, deadline, assignedTo, project, tags,
      createdBy: req.user._id,
    });
    await task.populate('assignedTo', 'name email');
    await task.populate('project', 'title color');
    await task.populate('createdBy', 'name');
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title color')
      .populate('createdBy', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Members can only update status of their own tasks
    if (req.user.role === 'member') {
      if (task.assignedTo?.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'Not authorized to edit this task' });
      if (req.body.status) task.status = req.body.status;
    } else {
      const { title, description, status, priority, deadline, assignedTo, tags } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (deadline !== undefined) task.deadline = deadline;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (tags) task.tags = tags;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('project', 'title color');
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
