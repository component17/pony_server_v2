module.exports = (sensor_id) => {
    let module_index = store.modules.findIndex(i => i.device_id === sensor_id);

    if(module_index >= 0){
        let module = store.modules[module_index];

        try{
            if(!state_modules.modules[module.section_id]) throw new Error();
            let state = [...state_modules.modules[module.section_id]];


            if(state.length === 1){
                if(!state[0].isError){
                    if(state[0].id === module.id){
                        delete state_modules.modules[module.section_id];
                    }else{
                        state.push({id: module.id, isError: true});
                        state_modules.modules[module.section_id] = state
                    }
                }else{
                    delete state_modules.modules[module.section_id];
                }
                throw new Error()
            }

            if(state.length > 2){
                delete state_modules.modules[module.section_id];
                throw new Error()
            }

            if(state.filter(i => i.isError === true).length > 1){
                delete state_modules.modules[module.section_id];
                throw new Error()
            }
            if(state.filter(i => i.isError === false).length > 1){
                delete state_modules.modules[module.section_id];
                throw new Error()
            }

            let not_error_index = state.findIndex(i => i.isError === false);

            if(state[not_error_index].id === module.id){
                delete state_modules.modules[module.section_id];
                throw new Error()
            }

            let error_index = state.findIndex(i => i.isError === true);

            if(state[error_index].id !== module.id){
                state[error_index].id = module.id;
                state_modules.modules[module.section_id] = state;
                throw new Error();
            }
            return true;
        }catch (e) {
            return true
        }
    }else{
        return true
    }
};