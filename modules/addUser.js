var mongodb = require('mongodb');

var db = new mongodb.Db('RIPTA', new mongodb.Server('localhost', 27017), {w:1});
db.open(function(){
	db.collection('users', function(err, collection){
		var user = {
			"full_name" : "Alexis Rodriguez", 
			"short_name" : "Alexis",
			"number" : "6155856899",  }
		collection.insert(user, function(err){
			db.close();
		});
	});
});
