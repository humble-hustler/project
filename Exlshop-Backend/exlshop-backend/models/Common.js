/********************************************************/
/***** Common Model *****/
/********************************************************/

const Brands = (connection, logger) => {
    const module = {}

    module.GetCountries = (options, callback) => {
        connection.query("SELECT * FROM countries", (err, countries) => {
            if (err) {
                callback(err)
            } else {
                callback(false, countries)
            }
        })
    }
    
    module.getPromotionImage = (callback) =>{
        connection.query('select * from promotions where is_deleted = 0',(err, data) =>{
            if(err){
                callback(err)
            }else{
                callback(false, data)
            }
        })
    }

    module.GetStates = (options, callback) => {
        connection.query("SELECT * FROM states WHERE country_id = ?", [options.countryId], (err, states) => {
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

    module.GetAgeGroup = (options, callback) => {
        connection.query(`SELECT * FROM wo_age_group`, (err, groups) => {
            if (err) {
                callback(err)
            } else {
                callback(false, groups)
            }
        })
    }

    module.GetRoles = (callback) =>{
        connection.query(`select * from roles`, (err, roles) =>{
            if(err){
                callback(err)
            }else{
                callback(false, roles)
            }
        })
    }
    return module;
};
module.exports = Brands;