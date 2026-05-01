const express = require('express');
const { body } = require('express-validator');
const {
  getProjects, createProject, getProject, updateProject, deleteProject,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(
    adminOnly,
    [body('title').trim().notEmpty().withMessage('Project title is required')],
    createProject
  );

router.route('/:id')
  .get(getProject)
  .put(adminOnly, updateProject)
  .delete(adminOnly, deleteProject);

module.exports = router;
