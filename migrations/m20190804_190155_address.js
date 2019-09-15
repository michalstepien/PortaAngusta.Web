"use strict";
exports.name = "address";

exports.up = function (db) {
  return db.class.create('Address', 'LogDate')
    .then(
      function (Address) {
        console.log('Created Address class');
        return Address.property.create([
          { name: 'country', type: 'String' },
          { name: 'city', type: 'String' },
          { name: 'streetName', type: 'String' },
          { name: 'streetNumber', type: 'String' },
          { name: 'postalCode', type: 'String' },
          { name: 'location', type: 'Embedded', linkedType: 'OPOint' }
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
  return db.class.drop('Address')
    .then(function (d) {
      console.log('Class Address deleted');
    });
};

