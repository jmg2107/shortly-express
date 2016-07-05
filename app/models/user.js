var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimeStamps: false,

  hashPassword: function(model, attrs, options) {
    return new Promise(function(resolve, reject) {
      bcrypt.hash(model.get("password"), 10, function(err, hash) {
        console.log("password: " + model.get("password"));
        if (err) {
          reject(err);
        } else {
          console.log("password: " + model.get("password"));
          model.set('password', hash);
          console.log("password hash: " + hash);
          resolve(hash);
        }
      });
    });
  },

  initialize: function() {
    //when we initialize the table, we set up the columns of
    //username and password directly from shortly.js
    //then we create a bcrypt hash for the password and store it.
    this.on('creating', this.get("hashPassword"));
  }
});

module.exports = User;