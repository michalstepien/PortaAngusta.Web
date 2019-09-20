"use strict";
exports.name = "cluster_company_jdg";

exports.up = function (db) {
  return db.cluster.create('jdg')
    .then(
      function (jdg) {
        return db.exec("ALTER CLASS Company ADDCLUSTER jdg").then(function(){
          console.log('Created cluster jdg');
        });
      }
    ).catch(function (e) {
      console.log(e);
    });
};

exports.down = function (db) {
  return db.cluster.drop('jdg')
    .then(
      function (jdg) {
        console.log('Drop cluster jdg');
      }
    ).catch(function (e) {
      console.log(e);
    });
};

