const ErrorCodes = require('../../errorCodes')
const versions = require('./versions');
const express = require('express');
const router = express.Router();

let jwt = require('jsonwebtoken');
const config = require('../../config');

router.use('/:version/:object/:action', function (req, res) {

    const params = req.params;
    const post = req.body;
    post.files = req.files;
    post.session = req.session;
    const query = req.query;
    const model = require('../../models');
    const Object = params.object;
    const Action = params.action;
    const Version = params.version;
    const method = req.method;
  
    let request = ''
    
    if (method === 'POST' || method === 'PUT') {
        request = post;
    } else if(method === 'GET') {
        request = query;
    }
    if (typeof versions[Version][Object][Action] === 'function' ){
      
        versions[Version][Object][Action](model, request, method, function (err, data) {
            if (err)  {
                res.status(400).send(data);
            } 
            else{
               
                res.status(200).send(data);
            }
            
        });
    } else {
        res.send({success: false, error: ErrorCodes[005], code: '005'});
    }
});

module.exports = router;