var mongoose = require('mongoose');

mongoose.connect("mongodb://" + process.env.DB_USER + ":" +
	process.env.DB_PASS + "@dharma.mongohq.com:10000/ripta");

var Schema = mongoose.Schema;

var Alias = new Schema({
	name: {type: String, required: true, trim: true},
	id: {type: Number},
	in_name: {type: String, required: true, trim: true},
	out_name: {type: String, required: true, trim: true},
	in_id: {type: Number},
	out_id: {type: Number},
});

var alias = mongoose.model('alias', Alias);

var newAlias = {
	"name" : "thayer",
	"id" : 0,
	"in_name" : "BUS TUNNEL FAR SIDE THAYER",
	"out_name" : "BUS TUNNEL NEAR SIDE THAYER",
	"in_id" : 17045,
	"out_id" : 16905,
};

newAlias = {
	"name" : "esm",
	"id" : 1,
	"in_name" : "PITMAN AT EAST SIDE MARKETPLACE",
	"out_name" : "PITMAN AT EAST SIDE MARKETPLACE",
	"in_id" : 16645,
	"out_id" : 16645
};

var aliasObj = new alias(newAlias);

aliasObj.save(function(err, data){
    if(err){
        console.log(err);
    } else {
        console.log(data);
    }
    mongoose.connection.close();
});
