const express = require('express');
const router = express.Router();

const status = require('../../utils/os_info');

router.get('/', async (req, res) => {
    let result = await status();
    res.status(200).json(result);
});

module.exports = router;