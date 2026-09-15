const express = require('express');
const router = express.Router();
const { getAllWildlife, getWildlifeBySlug } = require('../controllers/wildlifeController');

router.get('/', getAllWildlife);
router.get('/:slug', getWildlifeBySlug);

module.exports = router;
