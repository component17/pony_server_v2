let log = (req, res, next) => {
    if(req.originalUrl !== '/'){
        const startHrTime = process.hrtime();

        res.on("finish", () => {
            const elapsedHrTime = process.hrtime(startHrTime);
            const elapsedTimeInMs = (elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6).toFixed(2);

            const data = {
                method: req.method,
                path: req.protocol + '://' + req.get('host') + req.originalUrl,
                status: res.statusCode,
                content_type: req.headers.accept,
                time: elapsedTimeInMs,
                headers: req.headers,
                body: req.body
            };

            io.sockets.emit('log:http', data);
        });
    }
    next();
};

module.exports = log;
