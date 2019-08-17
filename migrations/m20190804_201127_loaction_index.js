"use strict";
exports.name = "loaction index";

exports.up = function (db) {
  db.index.constructor.prototype.db = db;
  return db.index.create([{
    name: 'Address.Location',
    type: 'SPATIAL',
    engine: 'LUCENE'
  }]).then(
    function (index) {
      console.log("create index: Address.Location");
      return Promise.resolve(2);
    }
  ).catch(function (err) {
    console.log(err);
  });
};

exports.down = function (db) {
   db.index.drop('Address.Location').then(
    function (index) {
      console.log('Drop Index: Address.Location');
    }
  ).catch(function (err) {
    console.log(err);
  });
};

