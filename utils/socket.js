const sensor = require('./sensor');

io.on('connection', (socket) => {

    console.log('Connected new socket client');

    socket.on('sensor:detect', (id) => {
        sensor(id)
    });
});