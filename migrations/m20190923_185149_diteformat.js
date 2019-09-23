"use strict";
exports.name = "diteformat";

exports.up = function (db) {
  return db.exec("ALTER DATABASE DATETIMEFORMAT \"yyyy-MM-dd'T'HH:mm:ss.SSS'Z'\"").then(function(){
    console.log('Change format datetime to ISO 8601');
  });
};

exports.down = function (db) {
  // @todo implementation
};

