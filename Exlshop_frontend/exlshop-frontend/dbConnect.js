/********************************************************/
/***** Connect to MySQL *****/
/********************************************************/
const logger = require('./logger');
const config = require('./config');
const util = require('util')
const mysql = require('mysql')
const pool = mysql.createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.name,
    debug: config.db.debug,
    multipleStatements: true
})

// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            logger.error.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            logger.error.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            logger.error.error('Database connection was refused.')
        }
    }

    if (connection)
    {
        console.log("database is connected!!!")
        connection.release()
    }
        

    return
})

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query)

module.exports = pool