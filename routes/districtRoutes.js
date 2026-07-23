const express = require('express');
const router = express.Router();

const District = require('../models/District');

router.get('/:name', async (req, res) => {
  try {

    const district = await District.findOne({
      name: req.params.name
    });

    if (!district) {
      return res.status(404).json({
        message: 'District not found'
      });
    }

    res.json(district);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
});

module.exports = router;