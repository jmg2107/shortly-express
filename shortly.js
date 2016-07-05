var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var session = require('express-session');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({secret: 'cookie', resave: true}));

function checkUser(req, res, next) {
  if (req.session.username) {
    next();
  } else {
    //req.session.error = 'Access denied!';
    res.redirect('/login');
    //res.send({redirect: '/login'}).end();
  }
}

app.get('/', checkUser,
function(req, res) {
    res.render('index');
});

app.get('/create',
function(req, res) {
  checkUser(req, res, function(){
    res.render('index');
  });
  //res.rennder('index');
});

app.get('/links',
function(req, res) {
  checkUser(req, res, function() {
      Links.reset().fetch().then(function(links) {
      res.send(200, links.models);
    });
  });
});

app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

// signup route
app.get('/signup',
function(req, res) {
  res.render('signup');
});

app.post('/signup',
function(req, res) {
  new User({username: req.body.username}).fetch().then(function(found) {
    if (found) {
      res.redirect('/login');
    } else {
      var user = new User({
        username: req.body.username,
        password: req.body.password
      });
//We need to trigger the initialize listener for USERS in order
//to hash the password and save the hashed password
      user.save().then(function(newUser) {
        newUser.fetch().then(function(data) {
          console.log(data);
        });
        Users.add(newUser);
        //req.session.regenerate(function(){
          req.session.username = req.body.username;
        //});
        res.redirect('/');
       // res.send(201);
      });
    }
  });
});
  // POST request
  // adding user to users table

// login route
app.get('/login',
function(req, res) {
  res.render('login');
});


app.post('/login',
function(req, res) {
  console.log('username: ' + req.body.username);
  new User({username: req.body.username}).fetch().then(function(found) {
    if (found) {
      req.session.regenerate(function(){
        req.session.username = req.body.username;
        console.log("found username");
        res.redirect('/');
      });
    } else {
      console.log("username not found");
      res.redirect('/login');
    }
  });
});

app.get('/logout',
function(req, res) {
  req.session.destroy(function(err) {
    console.log("destroying session");
    if (err) {
      console.log('getting error');
    } else {
      console.log('not getting error');
    }
  });
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
