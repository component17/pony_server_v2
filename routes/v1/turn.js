const express = require('express');
const router = express.Router();

router.get('/state', (req, res) => {
    res.status(200).json(state_modules.modules);
});

router.get('/all/on', (req, res) => {
    let item = {};
    let ids = store.modules.map(i => {
        if(item[i.section_id]){
            item[i.section_id].push({id: i.id, isError: false})
        }else{
            item[i.section_id] = [{id: i.id, isError: false}]
        }
    });

    state_modules.modules = item;

    res.status(200).json(state_modules.modules);
});

router.get('/all/off', (req, res) => {
    state_modules.modules = {};
    res.status(200).json(state_modules.modules);
});

router.get('/section/:id/on', (req, res) => {
    let modules = store.modules.filter(i => i.section_id === req.params.id).map(i => {return {id: i.id, isError: false}});
    state_modules.modules[req.params.id] = modules;
    res.status(200).json(state_modules.modules);
});

router.get('/section/:id/off', (req, res) => {
    if(state_modules.modules[req.params.id]){
        delete state_modules.modules[req.params.id]
    }
    res.status(200).json(state_modules.modules);
});

router.get('/module/:id/on', (req, res) => {
    let index = store.modules.findIndex(i => i.id === req.params.id);

    if(index >= 0){
        let module = store.modules[index];
        state_modules.modules[module.section_id] = [{id: module.id, isError: false}];
    }

    res.status(200).json(state_modules.modules);
});

router.post('/alias', (req, res) => {
    let index = store.modules.findIndex(i => i.name === req.body.alias);

    if(index >= 0){
        let module = store.modules[index];
        state_modules.modules[module.section_id] = [{id: module.id, isError: false}];
    }

    res.status(200).json('ok');
});

module.exports = router;