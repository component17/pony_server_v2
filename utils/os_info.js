let os_utils = require('os-utils');
let pi = require('node-raspi');
let os = require('os');

let pjson = require('../package.json');

let start_time = new Date();

let getIP = () => {
    let ifaces = os.networkInterfaces();
    let ip = null;
    Object.keys(ifaces).forEach(function (ifname) {
        var alias = 0;

        ifaces[ifname].forEach(function (iface) {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                return;
            }

            if (alias >= 1) {
                // this single interface has multiple ipv4 addresses
            } else {
                // this interface has only one ipv4 adress

                if(ifname === 'eth0'){
                    ip = iface.address
                }
            }
            ++alias;
        });
    });

    return ip;
};

let getInfo = () => {
    return new Promise((resolve, reject) => {
        os_utils.cpuUsage((v) => {
            let res = null;
            if(os.platform() === 'darwin'){
                res = {
                    cpu: (v * 100).toFixed(),
                    ram: ((os_utils.totalmem() - os_utils.freemem()) / os_utils.totalmem() * 100).toFixed(),
                    ip: getIP(),
                    start_time,
                    temp: '47.77',
                    volt: '4.925',
                    uptime_os: 782300,
                    version: pjson.version,
                    sections: store.sections.length,
                    modules: store.modules.length
                };
            }else{
                res = {
                    cpu: (v * 100).toFixed(2),
                    ram: ((os_utils.totalmem() - os_utils.freemem()) / os_utils.totalmem() * 100).toFixed(),
                    ip: getIP(),
                    start_time,
                    temp: pi.getThrm().toFixed(2),
                    volt: pi.getVcc() / 1000,
                    uptime_os: pi.uptime(),
                    version: pjson.version,
                    sections: store.sections.length,
                    modules: store.modules.length
                };
            }

            resolve(res);
        });
    })
};

let run = async () => {
    try {
        let res = await getInfo();
        io.sockets.emit('info:os', res);

        setTimeout(() => {
            run();
        }, 5000)
    }catch (e) {
        console.log(e)
    }
};

run();