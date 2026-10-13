/********************************************************/
/***** CRON *****/
/********************************************************/
require('./cron/houseKeeping');

/********************************************************/
/***** Custom Requires *****/
/********************************************************/
const config = require('./config');
const logger = require('./logger');

/********************************************************/
/***** Node Modules *****/
/********************************************************/
const fs = require('fs');
const flash = require('express-flash');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const moment = require('moment-timezone');
const csrf = require('csurf');
const fileUpload = require('express-fileupload');

/********************************************************/
/***** Require Routes *****/
/********************************************************/
const index = require('./routes/index');

/********************************************************/
/***** Super Admin *****/
/********************************************************/
const suDashboard = require('./routes/super-admin/dashboard');
const suCommon = require('./routes/super-admin/common');
const suBrands = require('./routes/super-admin/brands');
const suLocations = require('./routes/super-admin/locations');
const suTeam = require('./routes/super-admin/team');
const suMarketing = require('./routes/super-admin/marketing');
const suSettings = require('./routes/super-admin/settings');
const suEvents = require('./routes/super-admin/events');
const suShop = require('./routes/super-admin/shop');
const suMember = require('./routes/super-admin/members');
const suLeads = require('./routes/super-admin/leads');
const suChat = require('./routes/super-admin/chat');

/********************************************************/
/***** Users *****/
/********************************************************/
const dashboard = require('./routes/app/dashboard');
const subscriptionrequest = require('./routes/app/subscriptionrequest');
const common = require('./routes/app/common');
const members = require('./routes/app/members');
const packages = require('./routes/app/packages');
const settings = require('./routes/app/settings');
const sales = require('./routes/app/sales');
const reports = require('./routes/app/reports');
const schedule = require('./routes/app/schedule');
const leads = require('./routes/app/leads');
const assets = require('./routes/app/assets');
const users = require('./routes/app/users');
const chats = require('./routes/app/chats');
const accounts = require('./routes/app/accounts');
const grouporders=require('./routes/app/grouporders');
const viewstock =require('./routes/app/viewstock');
const staffdashboard=require('./routes/app/staffdashboard');
const orders=require('./routes/app/orders');
const custmor=require('./routes/app/custmor');
const promotions=require('./routes/super-admin/promotions');

/********************************************************/
/***** Users *****/
/********************************************************/
// const apiUsers = require('./routes/api/users');
// const apiDashboard = require('./routes/api/dashboard');
// const apiChat = require('./routes/api/chat');

const api = require('./routes/api/index');
/********************************************************/
/***** Spawn Express App *****/
/********************************************************/
const app = express();

/********************************************************/
/***** Production Settings *****/
/********************************************************/
if (config.app.env !== 'dev') {
    var helmet = require('helmet');
    var minify = require('express-minify');
    var minifyHTML = require('express-minify-html');
    var uglifyEs = require('uglify-es');
    var compression = require('compression');
    app.use(compression());
    app.use(minify());
    app.use(minifyHTML({
        uglifyJsModule: uglifyEs,
        override: true,
        exception_url: false,
        htmlMinifier: {
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeEmptyAttributes: true,
            minifyJS: true
        }
    }));
    app.use(helmet());
}

/********************************************************/
/***** Set View Engine For Express. *****/
/***** '/views' folder acts as *****/
/***** theme folder *****/
/********************************************************/
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

/********************************************************/
/***** Connect MYSQL *****/
/********************************************************/
const dbCreds = {
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
    user: config.db.user,
    password: config.db.password,
}

/********************************************************/
/***** Configure Middlewares *****/
/********************************************************/
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger.express);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

/* Configure Sessions in MySQL */
const sessionStore = new MySQLStore(dbCreds);
const sessionSecret = fs.readFileSync('./sessionSecret').toString();
app.use(session({
    store: sessionStore,
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true
}));

/********************************************************/
/***** API Users *****/
/********************************************************/
// app.use('/api/users', apiUsers);
// app.use('/api/dashboard', apiDashboard);
// app.use('/api/chat', apiChat);
app.use('/api',api)
/********************************************************/
/***** Init CSRF *****/
/********************************************************/
app.use(csrf());

/********************************************************/
/***** Setup local functions *****/
/********************************************************/


app.use((req, res, next) => {
    req.uploadDir = config.app.uploadDir;
    req.Core = {
        Models: require('./models'),
        ErrorCodes: require('./errorCodes')
    };
    res.locals.session = req.session;
    res.locals.env = config.app.env;
    res.locals._csrf = req.csrfToken();
    res.locals.csrf_html = '<input type="hidden" value="' + req.csrfToken() + '" name="_csrf" />';
    res.locals.formatDate = (date, format) => {
        let fDate = moment(date).format(format);
        return (fDate === 'Invalid date') ? '' : fDate;
    };
    res.locals.addStyle = (styles) => {
        let dep = '';
        if (typeof styles !== 'undefined') {
            styles.forEach((style) => {
                dep += '<link rel="stylesheet" href="' + style + '">'
            })
        }
        return dep;
    }
    res.locals.addScript = (script) => {
        let dep = '';
        if (typeof script !== 'undefined') {
            script.forEach((script) => {
                dep += '<script src="' + script + '"></script>'
            })
        }
        return dep;
    }
    req.awsSESConfig = config.awsSESConfig;
    req.smsConfig = config.smsConfig;
    next();
});

/********************************************************/
/******* Use this function as middleware in Route *******/
/******* to allow access to sessioned users *************/
/********************************************************/
function checkAuth(req, res, next) {
    if (!req.session.user) {
        res.redirect('/403');
    } else {
        next();
    }
}

function checkPlanExpire(req, res, next){
    console.log(req.session.user.currentLocation.end_date)
    let endDate = new Date(req.session.user.currentLocation.end_date)
    endDate.setDate(endDate.getDate() + 1) 
    console.log(endDate, new Date())
    if(new Date() < endDate){
        next()
    }else{
        res.redirect('/403');
    }
}

// checkPlanExpire()

/********************************************************/
/***** Define Routes *****/
/********************************************************/
/* APP ROUTES */
app.use('/', index);

/********************************************************/
/***** Super Admin Routes *****/
/********************************************************/
app.use('/super-admin/dashboard', checkAuth, suDashboard);
app.use('/super-admin/common', checkAuth, suCommon);
app.use('/super-admin/brands', checkAuth, suBrands);
app.use('/super-admin/brands/locations', checkAuth, suLocations);
app.use('/super-admin/brands/locations/team', checkAuth, suTeam);
app.use('/super-admin/marketing', checkAuth, suMarketing);
app.use('/super-admin/settings', checkAuth, suSettings);
app.use('/super-admin/events', checkAuth, suEvents);
app.use('/super-admin/shop', checkAuth, suShop);
app.use('/super-admin/brands/locations/members', checkAuth, suMember);
app.use('/super-admin/marketing/leads', checkAuth, suLeads);
app.use('/super-admin/chat', checkAuth, suChat);
app.use('/super-admin/requested/categories',checkAuth,);
app.use('/super-admin/promotions',checkAuth, promotions);


/********************************************************/
/***** Define Routes *****/
/********************************************************/
app.use('/app/dashboard', checkAuth, dashboard);
app.use('/app/subscriptionrequest',checkAuth,subscriptionrequest)
app.use('/app/common', checkAuth,checkPlanExpire, common);
app.use('/app/members', checkAuth, checkPlanExpire, members);
app.use('/app/packages', checkAuth, checkPlanExpire, packages);
app.use('/app/settings', checkAuth, checkPlanExpire, settings);
app.use('/app/sales', checkAuth, checkPlanExpire, sales);
app.use('/app/reports', checkAuth, checkPlanExpire, reports);
app.use('/app/schedule', checkAuth, checkPlanExpire, schedule);
app.use('/app/marketing/leads', checkAuth, checkPlanExpire, leads);
app.use('/app/asset-management', checkAuth, checkPlanExpire, assets);
app.use('/app/grouporders',checkAuth,checkPlanExpire, grouporders)
app.use('/app/users', checkAuth, checkPlanExpire, users);
app.use('/app/chats', checkAuth,checkPlanExpire, chats);
app.use('/app/accounts', checkAuth, checkPlanExpire, accounts);
app.use('/app/view-stock', checkAuth, checkPlanExpire,viewstock );
app.use('/app/staffdashboard',checkAuth, checkPlanExpire,staffdashboard);
app.use('/app/orders',checkAuth, checkPlanExpire, orders);
app.use('/app/custmor',checkAuth , checkPlanExpire, custmor);

/********************************************************/
/***** Logout and destroy all set sessions *****/
/********************************************************/
app.use('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

/********************************************************/
/***** Handle 404 Template *****/
/********************************************************/
app.use('/404', (req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/********************************************************/
/***** Handle 403 Template *****/
/********************************************************/
app.use('/403', (req, res) => {
    res.status(403)
    res.render('front/unauthorized', {
        title: 'Unauthorized Access'
    });
});

/********************************************************/
/***** Error Handlers *****/
/********************************************************/
if (config.app.env !== 'dev') {
    app.use((err, req, res) => {
        res.status(err.status || 500);
        res.render('front/error', {
            title: 'Error',
            status: err.status,
            message: err.message,
            error: err
        });
    });
} else {
    app.use((err, req, res, next) => {
        res.status(500).send(err.stack)
        logger.error.error(err.stack)
        next()
    })
}


/********************************************************/
/***** Start Node app *****/
/********************************************************/
app.set('port', process.env.PORT || config.app.port);
server = app.listen(app.get('port'), () => {
    logger.info.info("UI started on Port " + app.get('port'));
});

//socket.io instantiation
const io = require("socket.io")(server);

//listen on every connection
var clients = [];
io.on('connection', (socket) => {

    //maintain a client list of all the socket users
    socket.on('connection-start', (data) => {
        if(!clients.length){
            clients.push({socketId: socket.id, userId: data.userId});
        }else{
            var noOfUsers = 0;
            clients.forEach(function(c){
                if(c.userId == data.userId){
                    c.socketId = socket.id;
                    noOfUsers++;
                }
            })
            if(!noOfUsers){
                clients.push({socketId: socket.id, userId: data.userId});
            }
        }
    })
    
    //sent-message event listener
    socket.on('send-message', (data) => {
        const axios = require('axios');
        axios.post('http://localhost:'+config.app.port+'/api/v1/chat/add', {
            message: data.message,
            fromUser: data.fromUser,
            toUser: data.toUser
        })
        .then(function (response) {
            var socketId = '';
            clients.forEach(function(c){
                if(c.userId == data.toUser){
                    socketId = c.socketId;
                }
            })
            io.to(socketId).emit('receive-message',{message: data.message, fromUser: data.fromUser, toUser: data.toUser})
        })
        .catch(function (error) {
            console.log(error);
        });
    })

    //listen on typing
    socket.on('typing', (data) => {
        console.log('typing ')
        var socketId = '';
        clients.forEach(function(c){
            if(c.userId == data.toUser){
                socketId = c.socketId;
            }
        })
        io.to(socketId).emit('typing',{fromUser: data.fromUser})
    })
    
    //listen on stop-typing
    socket.on('stop-typing', (data) => {
        console.log('not-typing ')
        var socketId = '';
        clients.forEach(function(c){
            if(c.userId == data.toUser){
                socketId = c.socketId;
            }
        })
        io.to(socketId).emit('stop-typing',{fromUser: data.fromUser})
    })

    //on disconnecting from the socket
    io.on('disconnect', (socket) => {
        console.log("socket disconnect")
        clients = clients.filter(function(c) {
            return c.socketId !== socket.id
        })
    })
})

require('./cron/emailAndSms');
module.exports = server