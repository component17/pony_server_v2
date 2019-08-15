const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    let settings = store.settings;

    res.status(200).json(settings);
});

router.post('/base-color', (req, res) => {
    console.log(req.body.color)
    if(!req.body.color || !req.body.color.r >=255 || !req.body.color.g >=255 || !req.body.color.b >=255) return res.status(403).json({message: 'Поле "Цвет" невалидно!'});

    store.settings.base_color = req.body.color;

    io.sockets.emit('model:update:settings');
    res.status(200).json({message: 'OK'})
});

router.post('/error-color', (req, res) => {
    if(!req.body.color || !req.body.color.r >=255 || !req.body.color.g >=255 || !req.body.color.b >=255) return res.status(403).json({message: 'Поле "Цвет" невалидно!'});

    store.settings.error_color = req.body.color;

    io.sockets.emit('model:update:settings');
    res.status(200).json({message: 'OK'})
});

router.post('/py-driver', (req, res) => {
    store.settings.enablePyDriver = req.body.enable;

    io.sockets.emit('model:update:settings');
    res.status(200).json({message: 'OK'})
});

module.exports = router;