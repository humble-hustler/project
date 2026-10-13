module.exports = {
    app: {
        port: 3336,
        env: 'dev', //dev, prod
        hostname: 'http://shop.fitbiz.tapsoft.in',
        coreHostname: 'http://fitbiz.tapsoft.in',
        uploadDir: __dirname + '/public/uploads'
    },
    db: {
        host: 'fitbiz.tapsoft.in',
        port: 3306,
        user: 'admin_fitbiz',
        password: 'gBN0xvvbkQ',
        name: 'admin_fitbiz',
        debug: false
    },
    razorpay: {
        keyId: 'rzp_test_HOHn4mjEOaUlKI',
        keySecret: 'fHkZURwH9gXcSJrcCPJ1HtMQ'
    }
}