const express = require('express');
const router = express.Router();
const ids = require('shortid');

router.get('/', (req, res) => {
    let result = store.sections.map( section => {
        let item = {...section};
        item.modules_count = store.modules.filter(i => i.section_id === section.id).length;
        return item;
    });
    res.status(200).json(result)
});

router.get('/all', (req, res) => {
    let result = store.sections.map( section => {
        let item = {...section};
        item.modules = store.modules.filter(i => i.section_id === section.id);
        return item;
    });
    res.status(200).json(result)
});

router.get('/:id', (req, res) => {
    let index = store.sections.findIndex(i => i.id === req.params.id);

    if(index === -1) return res.status(404).json({message: 'Секции не существует!'});

    let result = {...store.sections[index]};

    result.modules = store.modules.filter(i => i.section_id === result.id);
    result.modules_count = result.modules.length;

    res.status(200).json(result);
});

router.post('/', (req, res) => {
    if(!req.body.name || !req.body.name.length) return res.status(500).json({message: 'Поле "Название" невалидно!'});

    let section = {
        id: ids.generate(),
        name: req.body.name
    };

    store.sections.push(section);

    section.modules_count = 0;

    io.sockets.emit('model:update:sections');

    res.status(200).json(section)
});

router.post('/:id', (req, res) => {
    if(!req.body.name || !req.body.name.length) return res.status(500).json({message: 'Поле "Название" невалидно!'});

    let section_index = store.sections.findIndex(i => i.id === req.params.id);

    if(section_index === -1) return res.status(404).json({message: 'Записи не существует!'});

    store.sections[section_index].name = req.body.name;

    let result = {...store.sections[section_index]};
    result.modules_count = store.modules.filter(i => i.section_id === result.id).length;

    io.sockets.emit('model:update:sections');

    res.status(200).json(result);
});

router.delete('/:id', (req, res) => {
    let section_index = store.sections.findIndex(i => i.id === req.params.id);

    if(section_index === -1) return res.status(404).json({message: 'Записи не существует!'});

    let section = {...store.sections[section_index]};

    let remove_indexes = [];
    store.modules.map((i, index) => {
        if(i.section_id === section.id){
            remove_indexes.push(index);
        }
    });

    remove_indexes.map(i => store.modules.splice(i, 1));
    store.sections.splice(section_index, 1);

    io.sockets.emit('model:update:sections');
    io.sockets.emit('model:update:modules');

    res.status(200).json({message: 'OK'});
});

module.exports = router;