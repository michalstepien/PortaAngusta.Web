"use strict";
exports.name = "lucenefirst";

exports.up = function (db) {
  return db.exec("CREATE INDEX Company.name ON Company(name) FULLTEXT ENGINE LUCENE").then(function(){
    console.log('Create index on company name');
  });
};

exports.down = function (db) {
  // @todo implementation
};

