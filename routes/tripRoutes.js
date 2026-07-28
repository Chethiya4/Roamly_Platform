const express = require('express');
const {
    createTrip,
    getMyTrips,
    deleteTrip
} = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All trip routes require authentication
router.use(protect);

router.route('/')
    .post(createTrip);

router.route('/mine')
    .get(getMyTrips);

router.route('/:id')
    .delete(deleteTrip);

module.exports = router;
