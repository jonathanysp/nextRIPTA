var mongodb = require('mongodb');

var db = new mongodb.Db('RIPTA', new mongodb.Server('localhost', 27017), {w:1});
db.open(function(){
	db.collection('users', function(err, collection){
		var user = {
			"full_name" : "Simone Kurial", 
			"short_name" : "Simone",
			"number" : "16199334334",  }
		collection.insert(user, function(err){
			db.close();
		});
	});
});
