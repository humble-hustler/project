module.exports = {
    app: {
        port: 3336,
        env: 'dev', //dev, prod
        hostname: 'http://localhost:3336',
        uploadDir: __dirname + '/public/uploads',
        imgURL: "http://apps.tapsoft.in:3336"
    },
    razorpay: {
        keyId: 'rzp_test_HOHn4mjEOaUlKI',
        keySecret: 'fHkZURwH9gXcSJrcCPJ1HtMQ'
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
    db: {
        host: '139.59.33.170',
        port: 3306, 
        user: 'admin_exlshop',
        password: 'Exlshop!@3',
        name: 'admin_exlshop',
        debug: false
    },
    aws: {
        key: 'AKIA55ADRAXLLDPL3BPI',
        secret: 'StCI+2vX2AD7irwL1zeWelMaKhPU2SAtX/C3HfCv',
        ses: {
            from: {
                // replace with actual email address
                default: 'purushottam.kamble@tapsoft.in', 
            },
            // e.g. us-west-2
            region: 'ap-south-1' 
        }
    },
    awsSESConfig:{
        apiVersion:'2010-12-01',
        accessKeyId:'AKIA55ADRAXLMHKTU4WC',
        secretAccessKey:'BDTHnKBI9j9UNuy3F8eooXEK8CrkmSHxqDt9Yy6X',
        region:'ap-south-1'
    },
    smsConfig:{
        loginId:'tapsoft',
        password:'Abc@1234'
    },
    secret: 'secretisamythtrytochangeit'
}
// console.log('hii');