const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const bodyParser = require('body-parser');
const cors = require('cors');
const http_log = require('./utils/http_log');
const spawn = require("child_process").spawn;

const path = require('path');

process.title = "Light Sorting";

const cleanExit = () => {
    console.log('\nServer stopped!!!');
    process.exit()
};
process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);

global.io = require('socket.io')(server);
global.store = require('./store/index');
global.state_modules = require('./state_modules/index');

server.listen(3000, () => {
    console.log('Start server 3000 port');

    if(store.settings.enablePyDriver){
        const pythonProcess = spawn('sudo', ["python3", __dirname + "/driver.py", "--port", "3000"], {
            detached: false,
            stdio: 'pipe'
        });

        process.on('exit', () => {
            pythonProcess.kill()
        });

        pythonProcess.on('error', (code) => {
            console.log('python process error with code ' + code);
        });

        pythonProcess.on('exit', (code) => {
            console.log('python process exited with code ' + code);
        });
    }
});

app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use('/api', http_log);

require('./utils/socket');

console.log(5555);

global.os_info = {
    cpu: 0,
    ram: 0,
    ip: null,
    start_time: new Date(),
    temp: '0',
    volt: '0',
    uptime_os: 0,
    version: 0,
    sections: 0,
    modules: 0
};

const child_process = require('child_process');

const forkedChild = child_process.fork('pony_server_v2/utils/os_info', ['build']);

forkedChild.on('message', (message) => {
    os_info = message;
    os_info.sections = store.sections.length;
    os_info.modules = store.modules.length;
    io.sockets.emit('info:os', os_info);
});

// require('./utils/os_info');

const {sections, modules, settings, turn, sensor, status} = require('./routes/v1/index');
app.use('/api/v1/sections', sections);
app.use('/api/v1/modules', modules);
app.use('/api/v1/settings', settings);
app.use('/api/v1/turn', turn);
app.use('/api/v1/sensor', sensor);
app.use('/api/v1/status', status);

const usb = require('usb');
const drivelist = require('drivelist');

usb.on('attach', async (device) => {
    const drives = await drivelist.list();
    console.log(drives);
});

usb.on('detach', function (device) {
    console.log(device)
});


