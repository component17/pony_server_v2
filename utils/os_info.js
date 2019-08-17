let os_utils = require('os-utils');
let pi = require('node-raspi');
let os = require('os');



let start_time = new Date();

let getIP = () => {
    let ifaces = os.networkInterfaces();
    let ip = '';
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
            res = {
                cpu: (v * 100).toFixed(),
                ram: ((os_utils.totalmem() - os_utils.freemem()) / os_utils.totalmem() * 100).toFixed(),
                ip: getIP(),
                start_time,
                temp: pi.getThrm(),
                volt: pi.getVcc(),
                uptime_os: pi.uptime()
            };
            resolve(res);
        });
    })
};

let run = async () => {
    try {
        let res = await getInfo();
        console.log(res);
        io.sockets.emit('info:os', res);

        setTimeout(() => {
            run();
        }, 5000)
    }catch (e) {
        console.log(e)
    }
};

run();