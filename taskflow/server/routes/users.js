const express = require('express');
const { getUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', adminOnly, getUsers);
router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(adminOnly, deleteUser);

module.exports = router;
