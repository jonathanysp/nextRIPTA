var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/RIPTA');

var Schema = mongoose.Schema;

var User = new Schema({
        full_name: {type: String, required: true, trim: true},
        short_name: {type: String, required: true, trim: true},
        number: {type: String, required: true, trim: true}
});

var user = mongoose.model('user', User);

var newUser = {
    full_name: "Neel Yalamarthy",
    short_name: "Neel",
    number: "19892749864"
};

var userObj = new user(newUser);

userObj.save(function(err, data){
    if(err){
        console.log(err);
    } else {
        console.log(data);
    }
    mongoose.connection.close();
});
