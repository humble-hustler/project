const Products = (connection, logger) => {
    const module = {}
}
module.getProducts = (options, callback) => {
    connection.query(`select *from shop_products where parent_id=0;`, (err, shop_categories) => {
        if (err) {
            callback(err)
        } else {
            callback(false, shop_categories)
        }
    })
}
module.exports = Products;