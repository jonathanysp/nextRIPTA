var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/RIPTA');

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
	"name" : "esm",
	"id" : 1,
	"in_name" : "PITMAN AT EAST SIDE MARKETPLACE",
	"out_name" : "PITMAN AT EAST SIDE MARKETPLACE",
	"in_id" : 16645,
	"out_id" : 16645,
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
