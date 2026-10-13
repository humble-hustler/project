const logger = require('../logger');
const cron = require('node-schedule');
const crypto = require('crypto');
const fs = require('fs');

cron.scheduleJob('0 0 * * 0', () => {
    crypto.randomBytes(48, (err, buffer) => {
        if (err) {
            logger.error.error(err)
        }
        let token = buffer.toString('hex');
        fs.writeFile('./sessionSecret', token, 'utf8', (err) => {
            if (err) {
                logger.error.error(err)
            }
        })

    });
});