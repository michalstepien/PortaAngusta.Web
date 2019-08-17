"use strict";
exports.name = "product";

exports.up = function (db) {
  db.class.create('Product').then(function(d){
    console.log('Created class Product');
  });
};

exports.down = function (db) {
  db.class.drop('Product')
    .then(function (d) {
        console.log('Class Product deleted');
    });
};
