var log4js = require('log4js');

if (!require('fs').existsSync('./logs')) {
    require('fs').mkdirSync('./logs');
}

log4js.configure({
    appenders: {
        access: {
            type: 'dateFile',
            filename: 'logs/access.log',
            pattern: '-yyyy-MM-dd',
            backups: 3
        },
        error: {
            type: 'dateFile',
            filename: 'logs/error.log',
            pattern: '-yyyy-MM-dd',
            backups: 3
        },
        console: {type: 'console'},
    },
    categories: {
        access: {
            appenders: [
                'console',
                'access'
            ],
            level: 'debug'
        },
        error: {
            appenders: [
                'console',
                'error'
            ],
            level: 'error'
        },
        default: {
            appenders: [
                'console',
                'access'
            ],
            level: 'all'
        },
    }
});

module.exports = {
    access: log4js.getLogger('access'),
    info: log4js.getLogger('info'),
    error: log4js.getLogger('error'),
    express: log4js.connectLogger(log4js.getLogger('access'), {level: 'debug'})
};