/********************************************************/
/***** Index Routes *****/
/********************************************************/
const auth = require('../auth');
const express = require('express');
const router = express.Router();
const async = require('async');
const moment = require('moment');
const { post } = require('request');

router.get('/', auth.checkPermission(['super-admin']), (req, res) => {
    res.render('super-admin/dashboard', {
        title: 'FitBiz - Admin Dashboard',
        menuActive: 'settings',
        submenuActive: '',
        scripts: ['/js/page-level/dashboard.js']
    });
})

router.get('/sales', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    async.parallel({
        sales: (callback) => {
            models.Sales.GetSales({all: false}, (err, sales) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, sales)
                }
            })
        } 
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {             
            res.render('super-admin/sales', {
                title: 'Exlshop - Sales',
                menuActive: '',
        		submenuActive: '',
                sales:result.sales,
                scripts: ['/global/vendor/toastr/toastr.min.js','/global/vendor/datatables.net/jquery.dataTables.js',, '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/sales.js'],
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/toastr/toastr.min.css']
               
            });
        }
    })
})
router.post('/sales-view-all', auth.checkPermission(['super-admin']), (req,res)=>{
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['a.fname','a.lname','a.email','a.phone','d.verbose'];
    const orderByColumn = orderByArr[req.body.order[0].column];
   
    models.Sales.GetSales1({ offset, limit, search}, (err, sales) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, draw: req.query.draw, recordsTotal: sales.total, recordsFiltered: sales.total, data: sales.sales})

        }
    })
})


router.get('/users', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    async.parallel({
        users: (callback) => {
            models.Users.GetUsers({all: false}, (err, users) => {
                if (err) {
                    callback(err)
                } else {
                    callback(null, users)
                }
            })
        } 
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else { 
            res.render('super-admin/users', {
                title: 'FitBiz - Users',
                users:result.users,
                menuActive: 'users',
                submenuActive: '',
                scripts: ['/global/vendor/toastr/toastr.min.js','/global/vendor/datatables.net/jquery.dataTables.js',, '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/users.js'],
                styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css','/global/vendor/toastr/toastr.min.css']
               
            });
        }
    })
})

router.post('/user/view-all', auth.checkPermission(['super-admin']), (req, res) => {
	const post = req.body;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['a.fname','a.lname','a.email','a.phone','d.verbose'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;
    models.Users.GetSuperAdmins({ offset, limit, search, orderByColumn, orderByValue}, (err, users) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, draw: req.query.draw, recordsTotal: users.total, recordsFiltered: users.total, data: users.users})
        }
    })
})

router.post('/user/add', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        fname: post.user_fname,
        lname: post.user_lname,
        email: post.user_email,
        phone: post.user_phone,
        password: post.user_password,
        roleId: 1
    }
  

    models.Users.AddSuperAdmin(options, (err,data) => {
        if (err) {
            res.send({ success: false })
        } else {
            res.send({ success: true})
        }
    })
})

router.post('/user/get-single', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const userId = post.userId;
    
    models.Users.GetSingle({userId}, (err, user) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success:true , user:user})
        }
    })
})

router.post('/user/update', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
    	id: post.update_user_id,
        fname: post.user_fname,
        lname: post.user_lname,
        email: post.user_email,
        phone: post.user_phone,
        roleId: 1
    }

    models.Users.Update(options, (err) => {
        if (err) {
            res.redirect('back')
        } else {
            res.redirect('back')
        }
    })
})

router.post('/user/delete', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        teamMemberId: post.user_id
    }
    models.Users.Delete(options, (err) => {
        if (err) {
            res.redirect('back')
        } else {
            res.redirect('back')
        }
    })
})

router.post('/user/search', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        userName: post.userName,
        roleId: 1
    }
    models.Users.SearchUser(options, (err, users) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, users})
        }
    })
});

router.get('/user/:id', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const userId = req.params.id;

    async.auto({
        userData: (cb) => {
            models.Users.GetSingle({userId}, (err, user) => {
                cb(err ? err : null, user)
            })
        },
        states: (cb) => {
            models.Common.GetStates({countryId: 101}, (err, states) => {
                cb(err ? err : null, states)
            })
        },
        cities: ['userData', (result, cb) => {
                models.Common.GetCities({stateId: result.userData.state_id}, (err, cities) => {
                    cb(err ? err : null, cities)
                })
        }],
        userEducations: (cb) => {
            models.Users.GetEducations({userId}, (err, educations) => {
                cb(err ? err : null, educations)
            })
        },
        userExperience: (cb) => {
            models.Users.GetExperience({userId}, (err, experience) => {
                cb(err ? err : null, experience)
            })
        },
        userSalaryLog: (cb) => {
            models.Users.GetUserSalaryLog({userId}, (err, salaryLog) => {
                cb(err ? err : null, salaryLog)
            })
        }
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('super-admin/single-user', {
                title: 'FitBiz - Users',
                menuActive: 'users',
        		submenuActive: '',
                user: result.userData,
                states: result.states,
                cities: result.cities,
                userEducations: result.userEducations,
                userExperience: result.userExperience,
                userSalaryLog: result.userSalaryLog,
                scripts: ['/global/vendor/toastr/toastr.min.js', '/global/vendor/webcam.js/webcam.min.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js', '/global/vendor/select2/select2.js', '/js/app/dashboard.js', '/js/page-level/single-user.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/select2/select2.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']                    
            });
        }
    }) 
});

router.post('/user/add/education', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        educationLevel: post.education_level,
        institute: post.institute,
        description: post.description,
        month: post.month,
        year: post.year,
        userId: post.user_id_education
    }
    models.Users.AddEducation(options, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later!');
        }
        res.redirect('back')
    })
})

router.post('/user/add/experience', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        jobPosition: post.job_position,
        employerName: post.employer_name,
        jobDescription: post.job_description,
        fromMonth: post.from_month_exp,
        fromYear: post.from_year_exp,
        toMonth: post.to_month_exp,
        toYear: post.to_year_exp,
        userId: post.user_id_experience
    }

    models.Users.AddExperience(options, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later!');
        }
        res.redirect('back')
    })
})

router.post('/user/update/experience', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        id: post.experience_id,
        jobPosition: post.job_position,
        employerName: post.employer_name,
        jobDescription: post.job_description,
        fromMonth: post.from_month_exp,
        fromYear: post.from_year_exp,
        toMonth: post.to_month_exp,
        toYear: post.to_year_exp
    }
    models.Users.UpdateExperience(options, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later!');
        }
        res.redirect('back')
    })
})

router.post('/user/update/education', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        id: post.education_id,
        educationLevel: post.education_level,
        institute: post.institute,
        description: post.description,
        month: post.month,
        year: post.year
    }
    models.Users.UpdateEducation(options, (err) => {
        if (err) {
            req.flash('error', 'Some error occurred. Please try again later!');
        }
        res.redirect('back')
    })
})

router.post('/user/update/profile-image', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const fs = require('fs');
    const userId = post.userId;
    const filename = `${userId}-${moment().unix()}.jpeg`;
    const imgDir = `${require('path').resolve()}/public/profile-img`;
    const imageData = post.imageData.replace(/^data:image\/jpeg;base64,/, "");

    if (fs.existsSync(imgDir) === false) {
        fs.mkdirSync(imgDir)
    }

    fs.writeFile(`${imgDir}/${filename}`, imageData, 'base64', (err) => {
        if (err) {
            res.send({success: false})
        } else {
            models.Members.UpdateProfileImage({userId, filename}, (err) => {
                if (err) {
                    res.send({success: false})
                } else {
                    res.send({success: true, filename: `/profile-img/${filename}`})
                }
            })
        }
    })
})

router.get('/dietitians', auth.checkPermission(['super-admin']), (req, res) => {
    res.render('super-admin/dietitian', {
        title: 'FitBiz - Dietitians',
        menuActive: '',
        submenuActive: '',
        scripts: ['/global/vendor/datatables.net/jquery.dataTables.js', '/global/vendor/datatables.net-bs4/dataTables.bootstrap4.js', '/js/page-level/dietitians.js'],
        styles: ['/global/vendor/datatables.net-bs4/dataTables.bootstrap4.css']
    });
})

router.post('/dietitian/view-all', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const offset = req.body.start;
    const limit = req.body.length;
    const search = req.body.search.value ? req.body.search.value : false;
    const orderByArr = ['a.fname','a.lname','a.email','a.phone','d.verbose'];
    const orderByColumn = orderByArr[req.body.order[0].column];
    const orderByValue = req.body.order[0].dir;

    models.Users.GetDietitians({ offset, limit, search, orderByColumn, orderByValue}, (err, dietitian) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true, draw: req.query.draw, recordsTotal: dietitian.total, recordsFiltered: dietitian.total, data: dietitian.dietitians})
        }
    })
})

router.post('/dietitian/add', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;

    const options = {
        fname: post.dietician_fname,
        lname: post.dietician_lname,
        email: post.dietician_email,
        phone: post.dietician_phone,
        password: post.dietician_password,
        roleId: 1
    }

    models.Users.AddDietitian(options, (err) => {
        if (err) {
            res.redirect('back')
        } else {
            res.redirect('back')
        }
    })
})

router.get('/dietitian/:id', auth.checkPermission(['super-admin']), (req, res) => {
    const models = req.Core.Models;
    const userId = req.params.id;

    async.auto({
        dieticianData: (cb) => {
            models.Users.GetSingle({userId}, (err, user) => {
                cb(err ? err : null, user)
            })
        },
        states: (cb) => {
            models.Common.GetStates({countryId: 101}, (err, states) => {
                cb(err ? err : null, states)
            })
        },
        cities: ['dieticianData', (result, cb) => {
                models.Common.GetCities({stateId: result.dieticianData.state_id}, (err, cities) => {
                    cb(err ? err : null, cities)
                })
        }],
        dietPlan: (cb) => {
            models.ShopProducts.GetDietitianBased({userId}, (err, dietPlan) => {
                cb(err ? err : null, dietPlan)
            })
        }
    }, (err, result) => {
        if (err) {
            res.redirect('/404')
        } else {
            res.render('super-admin/single-dietitian', {
                title: 'FitBiz - Dietitian',
                menuActive: '',
        		submenuActive: '',
                dietician: result.dieticianData,
                states: result.states,
                cities: result.cities,
                dietPlan: result.dietPlan,
                scripts: ['/global/vendor/toastr/toastr.min.js', '/global/vendor/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js', '/js/page-level/single-dietitian.js','/global/vendor/select2/select2.js'],
                styles: ['/global/vendor/toastr/toastr.min.css', '/global/vendor/select2/select2.css', '/global/vendor/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css']                    
            });
        }
    }) 
});

router.post('/dietitian/category/update', auth.checkPermission(['super-admin']), (req, res) => {
    const post = req.body;
    const models = req.Core.Models;
    const options = {
        dietPlans: post.dietPlans, 
        dietitianId: post.dietitianId
    }

    models.ShopProducts.AddDietitianCategories(options, (err) => {
        if (err) {
            res.send({success: false})
        } else {
            res.send({success: true})
        }
    })
})



module.exports = router;
