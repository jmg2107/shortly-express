var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimeStamps: false,

  hashPassword: function() {
    return new Promise(function(resolve, reject) {
      var currentPassword = this.get("password");
      var salt = bcrypt.genSalt(10, function(err, result){
        if(err){
          return err;
        } else {
          return result;
        }
      });
      console.log("salt is " + salt);
      bcrypt.hash(currentPassword, 10, null, function(err, hash) {
      console.log("bcrypt running");
        if(err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    }.bind(this))
    .then(function(hash){
      console.log("password: " + model.get("password"));
      model.set('password', hash);
      console.log("password hash: " + hash);
      })
    .catch(function(reason){
        console.log("we hit the catch error");
    });
  },

  initialize: function() {
    //when we initialize the table, we set up the columns of
    //username and password directly from shortly.js
    //then we create a bcrypt hash for the password and store it.
    this.on('creating', function(model, attrs, options){
      console.log ("model.get.password: " + model.get("password"));
      return this.hashPassword();

    });
  }
});

module.exports = User;