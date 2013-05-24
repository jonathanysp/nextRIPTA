var mongodb = require('mongodb');

var db = new mongodb.Db('RIPTA', new mongodb.Server('localhost', 27017), {w:1});
db.open(function(){console.log(db.state)});

exports.db = db;
