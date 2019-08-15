let default_state = {
    sections: [],
    modules: [],
    settings: {
        base_color: {
            r: 0,
            g: 255,
            b: 0
        },
        error_color: {
            r: 255,
            g: 0,
            b: 0
        },
        sing_request: false,
        jwt_tokens: [],
        enablePyDriver: true
    },
    authHash: null,
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
                onChangeFunction();
            }
            return val
        }
    };
    return new Proxy(objToWatch, handler);
};

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults(default_state).write();

let current_state = db.getState();

const setState = () => db.setState(current_state).write();

const store = onChange(current_state, setState);

module.exports = store;