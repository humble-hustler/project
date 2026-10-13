const AWS = require('aws-sdk');

const config = require('./config'); // load configurations file

AWS.config.update({
    accessKeyId: config.aws.key,
    secretAccessKey: config.aws.secret,
    region: config.aws.ses.region
});

const ses = new AWS.SES({apiVersion: '2010-12-01'});

const sendEmail = (to,token, subject, from) => {
    console.log("ghfsdfgsgfd",to,token,subject,from)
    const params = {
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: 'You requested for reset password, kindly use this <a href="https://admin.exlshop.com/Validate-user?token=' + token + '">link</a> to reset your password'
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        },
        ReturnPath: from ? from : config.aws.ses.from.default,
        Source: from ? from : config.aws.ses.from.default,
    };

    ses.sendEmail(params, (err, data) => {
        // if (err) {
        //     return console.log(err, err.stack);
        // } else {
        //     console.log("Email sent.", data);
        // }
        if (err) {
            console.log(1)
        } else {
            console.log(0)
        }
    });
};

module.exports = {sendEmail};