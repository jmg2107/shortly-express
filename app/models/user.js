var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimeStamps: false,

  initialize: function() {
    //when we initialize the table, we set up the columns of
    //username and password directly from shortly.js
    //then we create a bcrypt hash for the password and store it.
    this.on('creating', function(model, attrs, options){
      // return new Promise(function(resolve, reject) {
      //   bcrypt.hash(model.get("password"), 10, function(err, hash) {
      //     console.log("password: " + model.get("password"));
      //       reject(err);
      //       resolve(hash);
      //   });
      // })
      // .then(function(hash){
      //   console.log("password: " + model.get("password"));
      //   model.set('password', hash);
      //   console.log("password hash: " + hash);
      // });
    });
  }
});

module.exports = User;