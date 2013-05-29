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
	"name" : "wamp",
	"id" : 2,
	"in_name" : "PAWTUCKET AVE AT 1925 PAWTUCKET AVENUE",
	"out_name" : "PAWTUCKET AVE AT 1925 PAWTUCKET AVENUE",
	"in_id" : 58815,
	"out_id" : 58815
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
