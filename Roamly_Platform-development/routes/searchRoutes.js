const express = require('express');
const router = express.Router();
const { search } = require('../controllers/searchController');

// GET /api/search?q=<term>&type=all|destination|spot|business
router.get('/', search);

module.exports = router;
