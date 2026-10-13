const { options } = require("request");
const Common = (connection, logger) => {
    const module = {}
    module.GetCountries = (callback) => {
        connection.query("SELECT * FROM countries", (err, countries) => {
            if (err) {
                callback(err)
            } else {
                callback(false, countries)
            }
        })
    }
    module.GetStates = (options, callback) => {
        connection.query("SELECT * FROM states WHERE country_id = ?", [options.country_id], (err, states) => {
            if (err) {
                callback(err)
            } else {
                callback(false, states)
            }
        })
    }
    module.GetCities = (options, callback) => {
        var filterState = ``
        if (options) {
            filterState = `WHERE state_id = ${options.state_id}`
        }
        connection.query(`SELECT * FROM cities ${filterState}`, (err, cities) => {
            if (err) {
                callback(err)
            } else {
                callback(false, cities)
            }
        })
    }

    module.GetCities1 = (options, callback) => {
        var filterState = ``
        if (options) {
            filterState = `WHERE state_id = ${options.stateId}`
        }
        connection.query(`SELECT * FROM cities ${filterState}`, (err, cities) => {
            if (err) {
                callback(err)
            } else {
                callback(false, cities)
            }
        })
    }
    return module;
};
module.exports = Common;