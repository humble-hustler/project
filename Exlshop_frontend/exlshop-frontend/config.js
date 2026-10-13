//facebook module starts

// facebook module ends
module.exports = {
    app: {
        port: 3331,
        env: 'dev', //dev, prod
        hostname: 'http://localhost:3334',
        coreHostname: '',
        uploadDir: __dirname + '/public/uploads',
        imgURL: "https://admin.exlshop.com"
    },
       db: {
        host: '139.59.33.170',
        //host: 'localhost',
        port: 3306, 
        user: 'admin_exlshop',
        password: 'Exlshop!@3',
        //user: 'root',
        //password: 'root',
        name: 'admin_exlshop',
        debug: false,
    },
     // For Live
    // instamojo: {
    //     apiKey: 'a40b38f4789cae09f9b81f396da6df21',
    //     authKey: '880b7314589f74ca112882b221d3d79a'
    // },

    // For Testing
    instamojo: {
        apiKey: 'test_ca84c6c1afec5fc756fe6e58c4c',
        authKey: 'test_d3b757bba8e7af4406e1993c351'
    },
    fb:
    {
        "facebook_api_key"      :     "1097982544132254",
        "facebook_api_secret"   :     "6b1c8fd1bc6c48f2d71a04047e2dd13a",
        "callback_url"          :     "http://localhost:3331/auth/facebook/callback",
        "use_database"          :      false,
        "host"                  :     "localhost",
        "username"              :     "root",
        "password"              :     "",
        "database"              :     "Database Name"
      },
    razorpay: {
        keyId: 'rzp_test_HOHn4mjEOaUlKI',
        keySecret: 'fHkZURwH9gXcSJrcCPJ1HtMQ'
    },
    awsSESConfig:{
        apiVersion:'2010-12-01',
        accessKeyId:'AKIAJ2MQUVG4OJH4SF5A',
        secretAccessKey:'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',
        region:'ap-south-1'
    },
    smsConfig:{
        loginId:'tapsoft',
        password:'Abc@1234'
    },
    secret: 'secretisamythtrytochangeit'
}