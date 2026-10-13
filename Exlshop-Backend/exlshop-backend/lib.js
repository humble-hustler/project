var http = require('http');
var request= require('request');
const AWS = require('aws-sdk');
const config = require('./config')
const SESConfig = {
				    apiVersion:config.awsSESConfig.apiVersion,
				    accessKeyId:config.awsSESConfig.accessKeyId,
				    secretAccessKey:config.awsSESConfig.secretAccessKey,
				    region:config.awsSESConfig.region
				};

module.exports = {
    sendEmail : function(data, cb1){
    	var message = data.message;
       
        var params = {
            Source:'sidhi.volvoiker@tapsoft.in',
            Destination:{
                ToAddresses:[
                    data.to
                ]
            },
            ReplyToAddresses:[
                'sidhi.volvoiker@tapsoft.in'
            ],
            Message:{
                Body:{
                    Html:{
                    Charset:"UTF-8",
                    Data:data.message
                  }
                },
                Subject:{
                    Charset:'UTF-8',
                    Data:data.subject
                }
            }
        };
        new AWS.SES(SESConfig).sendEmail(params,function(err, data) {
            if (err) {
                console.log(err);
                cb1(err);
            }else{
                cb1(false)
            }          
        })
    }
    
};