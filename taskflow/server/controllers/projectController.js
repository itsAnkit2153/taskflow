const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');

// GET /api/projects
exports.getProjects = async (req, res, next) => {
  try {
    const query =
      req.user.role === 'admin'
        ? {}
        : { $or: [{ owner: req.user._id }, { members: req.user._id }] };
    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email role')
      .sort('-createdAt');
    res.json({ projects });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects
exports.createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, members, color } = req.body;
    const project = await Project.create({
      title, description, color,
      owner: req.user._id,
      members: members || [],
    });
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email role');
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { title, description, members, color, status } = req.body;
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (members) project.members = members;
    if (color) project.color = color;
    if (status) project.status = status;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email role');
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project and related tasks deleted' });
  } catch (err) {
    next(err);
  }
};
