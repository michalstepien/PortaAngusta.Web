"use strict";
exports.name = "address";

exports.up = function (db) {
  return db.class.create('Address', 'LogDate')
    .then(
      function (Address) {
        console.log('Created Address class');
        return Address.property.create([
          { name: 'Country', type: 'String' },
          { name: 'City', type: 'String' },
          { name: 'StreetName', type: 'String' },
          { name: 'StreetNumber', type: 'String' },
          { name: 'PostalCode', type: 'String' },
          { name: 'Location', type: 'Embedded', linkedType: 'OPOint' }
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

