let default_state = {
    modules: {},
};

const onChange = (objToWatch, onChangeFunction) => {
    const handler = {
        get(target, property, receiver) {
            const value = Reflect.get(target, property, receiver);
            if (typeof value === 'object') {
                return new Proxy(value, handler);
            }
            return value;
        },
        set(target, property, value) {
            let val = Reflect.set(target, property, value);
            if(Reflect.getOwnPropertyDescriptor(target, property)){
                onChangeFunction(property);
            }
            return val
        },
        deleteProperty(target, property) {
            delete target[property];
            onChangeFunction(property);
            return Reflect.deleteProperty(target, property);
        }
    };
    return new Proxy(objToWatch, handler);
};

let getColor = (section, id) => {
    let color = {r: 0, g: 0, b: 0};

    if(default_state.modules[section]){
        let index = default_state.modules[section].findIndex(i => i.id === id);

        if(index >=0){
            let isError = default_state.modules[section][index].isError;
            if(isError){
                color = store.settings.error_color
            }else{
                color = store.settings.base_color
            }
        }
    }
    return color;
};

let change_action = (property) => {
    if(property && typeof property !== "number" && property !== "length" && property.length > 5){
        let modules = store.modules.filter(i => i.section_id === property);

        let res = modules.map(i => {
            return {
                id: i.device_id,
                color: getColor(i.section_id, i.id)
            }
        });

        io.emit('switch', res);
        io.sockets.emit('state:update:modules', default_state.modules);
    }

};

const state = onChange(default_state, change_action);

module.exports = state;