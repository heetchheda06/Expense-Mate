const express = require('express');
const router = express.Router();
const { getProfiles, createProfile, updateProfile, deleteProfile } = require('../controllers/profileController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.route('/')
  .get(getProfiles)
  .post(createProfile);

router.route('/:id')
  .patch(updateProfile)
  .delete(deleteProfile);

module.exports = router;
