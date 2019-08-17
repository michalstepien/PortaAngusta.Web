"use strict";
exports.name = "date create update";

exports.up = function (db) {

  return db.class.create('LogDate')
    .then(
      function (LogDate) {

        console.log('Created class LogDate');

        return LogDate.property.create([
          { name: 'createDate', type: 'Date' },
          { name: 'updateDate', type: 'Date' }
        ]).then(
          function (property) {

          }
        ).catch(function (err) {
          console.log(err);
        });

      }
    ).catch(function (e) {
      console.log(e);
    });

};

exports.down = function (db) {

  return db.class.drop('LogDate')
    .then(function (d) {
      console.log('Class LogDate deleted');
    });
    
};

