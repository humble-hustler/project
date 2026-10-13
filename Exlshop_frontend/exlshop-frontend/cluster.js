const logger = require('./logger');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        logger.error.error(`worker ${worker.process.pid} died | code ${code} | signal ${signal}`);
    });
} else {
    require("./app.js");
}