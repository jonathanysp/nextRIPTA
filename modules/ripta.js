var mongodb = require('mongodb');
var db = require('./mydb.js').db;

var ini = false;
var server;

var aliasLookup = function(alias, callback){
    db.collection('alias', function(err, collection){
        collection.find({name: alias}).toArray(function(err, docs){
            var stop_ids = [];
            docs.forEach(function(doc){
                stop_ids.push(doc.in_id);
                stop_ids.push(doc.out_id);
            });
            console.log(stop_ids);
            callback(docs);
        });
    });
}

var serviceDate = function(date, callback){
    var dateString;
    switch(date.getDay()){
        case 1:
            dateString = "monday";
            break;
        case 2:
            dateString = "tuesday";
            break;
        case 3:
            dateString = "wednesday";
            break;
        case 4:
            dateString = "thursday";
            break;
        case 5:
            dateString = "friday";
            break;
        case 6:
            dateString = "saturday";
            break;
        case 7:
            dateString = "sunday";
            break;
    };
    db.collection('calendar', function(err, collection){
        var json = {};
        json[dateString] = 1;
        collection.find(json, {fields: {service_id: 1}}).toArray(function(err, docs){
            var service_ids = [];
            docs.forEach(function(doc){
                service_ids.push({service_id: doc.service_id});
            })
            console.log(service_ids);
            callback(service_ids);
            getStopTimes(17045, service_ids);
        });
    });
}

var getTrips = function(

var getStopTimes = function(stop_id, callback){
    db.collection('stop_times', function(err, collection){
        collection.find({stop_id: stop_id, arrival_time: /^20/}).toArray(function(err, docs){
            console.log(docs.length);
            var times = [];
            docs.forEach(function(doc){
                times.push(doc.arrival_time);
            });
            console.log(times);
        });
    });
}

setTimeout(function(){
    console.log(db.state);
    aliasLookup("thayer", function(doc){
        console.log("doc")
    });
    serviceDate(new Date(), function(){});
}, 20);
