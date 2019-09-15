"use strict";
exports.name = "company";

exports.up = function (db) {
  return db.class.create('Company', 'LogDate')
    .then(
      function (Company) {
        console.log('Created Company class');
        return Company.property.create([
          { name: 'name', type: 'String' },
          { name: 'addressEmbeded', type: 'Embedded', linkedClass: 'Address' },
          { name: 'addressesLinkset', type: 'LinkSet', linkedClass: 'Address' },
          { name: 'addressesList', type: 'LinkList', linkedClass: 'Address' },
          { name: 'addressesMap', type: 'LinkMap', linkedClass: 'Address' },
          { name: 'mainAddress', type: 'Link', linkedClass: 'Address' }
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

