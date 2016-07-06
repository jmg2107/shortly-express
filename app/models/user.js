var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimeStamps: false,

  hashPassword: function() {
    //promisify bcrypt function
    console.log("this is " + this);
    var cryptAsync = Promise.promisify(bcrypt.hash);
      // bind to model context
    // invoke promisified bcrypt
    return cryptAsync(this.get("password"), null, null).bind(this)
      .then(function(hash){
        console.log ("model.get.password: " + this.get("password"));
        console.log('hash: ' + hash);
        this.set({password: hash});
    // then reset user password to hashed password
      })
      .catch(function(err){
        console.log("we hit the catch error");
      });

  },

  initialize: function() {
    // when we initialize the table, we set up the columns of
    // username and password directly from shortly.js
    // then we create a bcrypt hash for the password and store it.
    this.on('creating', this.hashPassword);
  }
});

module.exports = User;