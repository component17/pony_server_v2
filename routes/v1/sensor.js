const express = require('express');
const router = express.Router();
const sensor = require('../../utils/sensor');

router.get('/:id', (req, res) => {
    sensor(req.params.id);
    res.status(200).json(state_modules.modules);
});

module.exports = router;