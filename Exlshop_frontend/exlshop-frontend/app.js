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
const curlrequest = require('curlrequest')
const fetch = require('node-fetch')
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
const admin = require("firebase-admin");
var key="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCBDdDtI7zVgZq4\nywbdnzA/jIaXmW+Up5YK5I//mzI0wZdd5wMX8kKiLO6+4AF8ee2zCp+Asxfdz9Nz\nwVQDGWNdwtiwkG+A1j3xJXR5osNqL41KefCAXJs3gYNvTWqzcOKejqushA0oGMZm\nwQf3ZKSj1rH47exQJFg2lhKn/f/T4Pj9uzLoSss97eZFF8AgeaM3rnmw7vtWPbAk\nelnq6dLzZQqtJXBQtD4C19AXypu+zEuhwmWyS1v1AV1B18zwFRNCTVjkqLJekq39\nng5NXmP2p6Sp4QF42PkLJ5OXNjhr2OEXwAcsXgDE1Bg0CrpyPz6mYgXE8cs9iu5h\ngZ/ism9LAgMBAAECggEAJqJftvZZbCNqEcM58XPcClJD4rN862hGK0mkcDViUNfZ\nvDNRwkP0vb8s0/iUiVKpHc3i1TEIRo+WclNglrLtg962Zxk+QDgjAAOh/F4FGU9W\nAYNCw/K1RucfVV08Qa7cMPJuI22+0I+mKZHFFENNZHz795UmhxFyVRkVSbRo92E3\n5Pdx/IWjKp5yqERExoVsyGgnmqIgHs95r3OjiB6FieG7lf6GDNQPl3GA2Adcv/9m\nTRCN2gstMc+M3Fz7j7+N38y5rBhnhcEXrspl7DT2eQbe7BGZ7A2RUr8AzF1eTX8Q\n5+pwYNAQCHQCzL5YjIKcKgGz9VKgUL4CXxllFLWwyQKBgQC12uMHyem/LuMtSuwN\nMYf9kz7G4OGRE9VmrV2eY+xl6kYUwoGry5Y4BZ0U1qFbv1enBh6Ft6KqcTKtAjTt\n2sktzDEpKraN8TdXaUqllrqhqFE2DLZdcNrABNZRg/+Oa1chwX7WE0f6+y54amMA\nitfhfO118G81SO3z/P9CYfUoeQKBgQC1q9IHpBOIFDbKFlLAdes62DttVWVbX0gp\niYTiQfUgC7UdGp+KGTGdytlSlMPa4DWswCNRdVuU63jz56QSpZbFptMNKEmOtaYq\nBxcwSPHRWcvIOTkmh/1sAbADjLJwARor9rsBoA0h2q/5grkYmnnMfpp1/ofmr8yO\nmYOl7QDs4wKBgFv2DXqh029XkZAU5Buj4YYMkOFXVRndMrwSjVYMZ73942SaG6K5\neARqak3gX4aa0wNmZ8bs3vhb9+lfRU7GpZdgO7f6nohW48pzN0lXWJdpG3A+q3XD\nHQufJpXgLzpg85XhWHd/FpZHsO85tUjP7W1clGRgqowCjjokxRxXlvbZAoGAWVkv\n6uIfWQXYDHv+JvnXvxEp6RPezZmG/CbOXBjkXeZkJPQ7EshhRqHFUIAp8zPiMhwt\nQprdd9h3nD2IzEL0bDEoC4iM5Msh9fmWxgCaLcRkHQ1HtlObp8sMrjI8cCmanZSz\nVJFK5COR+Lz6G8edr510iiOs4yADEv8daDWwBtECgYEAitF4PPVWPofBqB1mAcG2\nu4aQ60kfrkk2Ds4i1ZCGF/NpkMy6e2LJ5G1nlmUwVzqqWXex0aw6cYoCVYjvDPAz\nT1mE96Iki0FAn/oatmjmqp2kNgdpudZ7IEGJIapJOxy/WKYaN137MsGZvkvyNkVx\nx0BOqIP9oxKcVEgEMvkkUiw=\n-----END PRIVATE KEY-----\n";
admin.initializeApp({
	credential: admin.credential.cert({
		"private_key": key.replace(/\\n/g, '\n'),
		"client_email": "mailto:firebase-adminsdk-3oh87@exlshopproject.iam.gserviceaccount.com",
		"project_id": "exlshopproject"
	})
});

const index = require('./routes/index');
const shop = require('./routes/shop');
const myAccount = require('./routes/my-account');
const profile = require('./routes/profile');
const order = require('./routes/order');
const event = require('./routes/event');
const chat = require('./routes/chat');

/***** API Routes****************************************/
const api = require('./routes/api/index1');
//const api = require('./routes/api/index');
const apiShop = require('./routes/api/shop');
const apiOrder = require('./routes/api/order');
const apiMyAccount = require('./routes/api/my-account');
const apiEvent = require('./routes/api/event');
const apiUser = require('./routes/api/user');
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
const oneDay = 1000 * 60 * 60 * 24;

app.use(session({
    store: sessionStore,
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: oneDay }
}));

/* API ROUTES */
app.use('/api', api);
app.use('/api/shop', apiShop);
app.use('/api/order', apiOrder);
app.use('/api/my-account', apiMyAccount);
app.use('/api/event', apiEvent);
app.use('/api/user', apiUser);
/********************************************************/
/***** Init CSRF *****/
/********************************************************/
app.use(csrf());

/********************************************************/
/***** Setup local functions *****/
/********************************************************/
app.use((req, res, next) => {
    req.uploadDir = config.app.uploadDir;
    req.session.imgURL = config.app.imgURL;
    
    req.Core = {
        Models: require('./models'),
        ErrorCodes: require('./errorCodes')
    };
    res.locals.coreHostname = config.app.coreHostname;
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
    if (!req.session.csrfSecret) {
        res.redirect('/403');
    } else {
        next();
    } 
}

/********************************************************/
/***** Define Routes *****/
/********************************************************/
/* APP ROUTES */
app.use('/',checkAuth, index);
app.use('/shop',checkAuth, shop);
app.use('/my-account', checkAuth, myAccount);
app.use('/order', checkAuth, order);
app.use('/event',checkAuth, event);
app.use('/chat',checkAuth, chat);
app.use('/profile',checkAuth,profile);
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
module.exports = app.listen(app.get('port'), () => {
    logger.info.info("UI started on Port " + app.get('port'));
});



/********************FACEBOOK **************************/
// const express         =     require('express')
  const passport          =     require('passport');
  const FacebookStrategy  =     require('passport-facebook').Strategy;
  


// Passport session setup.
passport.serializeUser(function(fbuser, done) {
 
  done(null, fbuser);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FacebookStrategy within Passport.
var pass=
passport.use(new FacebookStrategy({
    clientID: config.fb.facebook_api_key,
    clientSecret:config.fb.facebook_api_secret ,
    callbackURL: config.fb.callback_url
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      //Check whether the User exists or not using profile.id
      if(config.use_database) {
        // if sets to true
        pool.query("SELECT * from user_info where user_id="+profile.id, (err,rows) => {
          if(err) throw err;
          if(rows && rows.length === 0) {
            
              pool.query("INSERT into user_info(user_id,user_name) VALUES('"+profile.id+"','"+profile.username+"')");
          } else {
              console.log("User already exists in database");
          }
        });
      }
      return done(null, profile);
    });
  }
));


app.use(session({ secret: 'keyboard cat', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){

  res.render('index', { user: req.user });
});



app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));


app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect : 'http://localhost:3331/', failureRedirect: '/' }),
  function(req, res) {
   
    res.redirect('http://localhost:3331/');
  });

  // app.get('/logout', function(req, res, next) {
    
  //   req.logout(function(err) {
  //     if (err) { return next(err); }
  //     res.clearCookie('connect.sid', {
  //       path: '/',
  //       secure: true,
  //       httpOnly: true,
  //       domain: 'http://localhost:3331/',
  //       sameSite: true,
  //     });
  //     res.clearCookie('connect', {
  //       path: '/',
  //       secure: true,
  //       httpOnly: true,
  //       domain: 'http://localhost:3331/',
  //       sameSite: true,
  //     });

  //     req.session.destroy(function() {
  //       //res.clearCookie('connect.sid');
  //       res.redirect('/');
  //   });
  //   });
  // });


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

// app.listen(3331);