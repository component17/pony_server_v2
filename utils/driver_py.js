const spawn = require("child_process").spawn;

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
