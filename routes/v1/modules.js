const express = require('express');
const router = express.Router();
const ids = require('shortid');

router.post('/', (req, res) => {
    if(!req.body.name || !req.body.name.length) return res.status(403).json({message: 'Поле "Название" невалидно!'});
    if(!req.body.device_id || !req.body.device_id.length) return res.status(403).json({message: 'Поле "ID модуля" невалидно!'});
    if(!req.body.section_id || !req.body.section_id.length) return res.status(403).json({message: 'Поле "Секция" невалидно!'});

    let index = store.modules.findIndex(i => i.device_id === req.body.device_id);
    if(index >= 0) return res.status(403).json({message: 'Данный модуль уже добавлен в систему!'});

    let module = {
        id: ids.generate(),
        name: req.body.name,
        device_id: req.body.device_id,
        section_id: req.body.section_id
    };

    store.modules.push(module);

    io.sockets.emit('model:update:sections');
    io.sockets.emit('model:update:modules');

    res.status(200).json(module)
});

router.post('/:id', (req, res) => {
    if(!req.body.name || !req.body.name.length) return res.status(500).json({message: 'Поле "Название" невалидно!'});
    if(!req.body.device_id || !req.body.device_id.length) return res.status(500).json({message: 'Поле "ID модуля" невалидно!'});
    if(!req.body.section_id || !req.body.section_id.length) return res.status(500).json({message: 'Поле "Секция" невалидно!'});

    let index = store.modules.findIndex(i => i.id === req.params.id);
    if(index === -1) return res.status(404).json({message: 'Модуль не существует!'});

    let module = {
        id: req.params.id,
        name: req.body.name,
        device_id: req.body.device_id,
        section_id: req.body.section_id
    };

    store.modules[index] = module;

    io.sockets.emit('model:update:sections');
    io.sockets.emit('model:update:modules');

    res.status(200).json(module)
});

router.delete('/:id', (req, res) => {
    let index = store.modules.findIndex(i => i.id === req.params.id);

    if(index === -1) return res.status(404).json({message: 'Модуля не существует!'});

    store.modules.splice(index, 1);

    io.sockets.emit('model:update:sections');
    io.sockets.emit('model:update:modules');

    res.status(200).json({message: 'OK'});
});

module.exports = router;