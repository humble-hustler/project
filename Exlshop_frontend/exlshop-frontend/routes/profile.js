/********************************************************/
/***** Index Routes *****/
/********************************************************/
const express = require('express');
const router = express.Router();
const async = require('async');
const _ = require('lodash');
const { connections } = require('../app');



router.get('/profile', (req, res) => {

    const options = req.session.user.id;
    const models = req.Core.Models;
   

    models.Users.getUserProfile(options,(err,profile)=>{
        if (err) {
          
            res.redirect('/404')
        } else {
            models.ShopProducts.getCategory({ all: true }, (err, shop_categories) => {
                if(err){
                    cb(err);
                }else{ res.render('front/profile', {
                    title: 'Exl-shop -Profile',
                    profile :profile,
                    shop_categories:shop_categories
                })}
            })
        }
    })
})

router.post('/update-profile', (req, res) => {
   
    let options = req.body ;
    const models = req.Core.Models;
   
    models.Users.UpdateUserProfile(options,(err,profile)=>{
        if (err) {
          
            res.redirect('/404')
        } else {
          
            return res.redirect('back');
        }
    })

})

module.exports = router;