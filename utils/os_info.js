let os_utils = require('os-utils');

let os = require('os');
let ifaces = os.networkInterfaces();

let ip = '';
let start_time = new Date();

Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
        }

        if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            console.log(ifname + ':' + alias, iface.address);
        } else {
            // this interface has only one ipv4 adress
            console.log(ifname, iface.address);

            if(ifname === 'en1'){
                ip = iface.address
            }
        }
        ++alias;
    });
});

setInterval(() => {
    os_utils.cpuUsage((v) => {
        let res = {
            cpu: (v * 100).toFixed(),
            ram: ((os_utils.totalmem() - os_utils.freemem()) / os_utils.totalmem() * 100).toFixed(),
            ip,
            start_time
        }
        io.sockets.emit('info:os', res);
        // console.log( 'CPU Usage (%): ' + v );
    });
}, 5000);