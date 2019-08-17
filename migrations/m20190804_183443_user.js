"use strict";
exports.name = "user";

exports.up = function (db) {
  db.class.create('User').then(function(d){
    console.log('Created class User');
  });
};

exports.down = function (db) {
  db.class.drop('User')
    .then(function (d) {
        console.log('Class User deleted');
    });
};

