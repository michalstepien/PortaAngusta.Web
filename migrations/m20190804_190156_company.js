"use strict";
exports.name = "company";

exports.up = function (db) {
  return db.class.create('Company', 'LogDate')
    .then(
      function (Company) {
        console.log('Created Company class');
        return Company.property.create([
          { name: 'Name', type: 'String' }
        ]).then(
          function (property) {
          }
        ).catch(function (err) {
          console.log(err);
        });
      }
    );
};

exports.down = function (db) {
  return db.class.drop('Company')
    .then(function (d) {
      console.log('Class Company deleted');
    });
};

