var mongodb = require('mongodb');
var async = require('async');
var nmo = require('./nexmo.js');

var db = new mongodb.Db('RIPTA', new mongodb.Server('localhost', 27017), {w:1});
db.open(function(){console.log(db.state)});
nmo.initialize('7daa0795', '92e1ebea', 'http', false);

var checkCallback = function(arguments){
	if(typeof arguments[arguments.length-1] === 'function'){
		return arguments[arguments.length-1];
	} else {
		return null;
	}
}

/* aliasLookup:
 * 	input:
 * 		alias (String/Integer)
 * 		inbound (Boolean, optional)
 * 		callback (function(int[] stop_ids))
 * 
 * looks up the stop_id for the alias
 */
 
var aliasLookup = function(alias, inbound, callback){
	var cb = checkCallback(arguments);
	db.collection('alias', function(err, collection){
		 if(!err) {
			collection.find({name: alias}).toArray(function(err, docs){
				var stop_ids = [];
				docs.forEach(function(doc){
					if(inbound === true){
						stop_ids.push(doc.in_id);
					} else if(inbound == false){
						stop_ids.push(doc.out_id);
					} else {
						stop_ids.push(doc.in_id);
						stop_ids.push(doc.out_id);
					}
				});
				if(cb){
					cb(stop_ids);
				}
			});
		}
	});
}
 
/* getServiceIds:
 * 	input:
 * 		date (Date)
 * 		callback (function(service_ids))
 * 
 * gets the valid service_ids from the provided date
 * returns array of json objects [{service_id: id}, {service_id: id}]
 */

var getServiceIds = function(date, callback){
	var cb = checkCallback(arguments);
	var dateString = {};
    switch(date.getDay()){
        case 6:
            dateString.saturday = 1;
            break;
        case 7:
            dateString.sunday =1;
            break;
        default:
            dateString.monday = 1;
            dateString.tuesday = 1;
            dateString.wednesday = 1;
            dateString.thursday = 1;
            dateString.friday = 1;
    };
    db.collection('calendar', function(err, collection){
        collection.findOne(dateString, {fields: {service_id: 1, _id: 0}}, function(err, doc){
            var service_ids = [];
            service_ids.push(doc.service_id);
            if(cb){
				cb(service_ids);
			}
        });
    });
}

/*
 * getRouteIds:
 * 	input:
 * 		route_name (e.g. 92, 42)
 * 		callback([route_id])
 * gets route ids from route name
 */

var getRouteIds = function(route_name, callback){
	var cb = checkCallback(arguments);
	async.waterfall([
		function(c){
			db.collection('routes', function(err, collection){
				c(err, collection);
			});
		},
		function(collection, c){
			collection.find({route_short_name: route_name}).toArray(function(err, docs){
				var names = [];
				docs.forEach(function(doc){
					names.push(doc.route_id);
				});
				c(err, names);
			});
		}], function(err, names){
			if(cb){
				cb(names);
			}
		});
}

/* getTripIds:
 * 	input:
 * 		stopIds (Integer[id])
 * 		callback (function(string[] trip_ids))
 * looks up all trips for given stop_id
 */

var getTripIds = function(stop_ids, callback){
	var cb = checkCallback(arguments);
	db.collection('stop_times', function(err, collection){
		collection.find({stop_id: {$in: stop_ids}}).toArray(function(err, docs){
			var trip_ids = [];
			docs.forEach(function(doc){
				trip_ids.push(doc.trip_id);
			})
			if(cb){
				cb(trip_ids);
			}
		});
	});
}

/* checkTrips:
 * 	input:
 * 		trip_ids (String[])
 * 		service_ids
 * 		callback (function(string[] trip_ids))
 * 
 * checks the trips with service_ids
 */

var checkTrips = function(trip_ids, service_ids, route_ids, callback){
	var cb = checkCallback(arguments);
	db.collection('trips', function(err, collection){
		var checked_ids = [];
		var counter = 0;
		
		query = {trip_id: {$in: trip_ids}, service_id: {$in: service_ids}};
		if(typeof route_ids === typeof []){
			query.route_id = {$in: route_ids};
		}
		
		collection.find(query).toArray(function(err, docs){
			docs.forEach(function(doc){
				checked_ids.push(doc.trip_id);
			});
			if(cb){
				cb(checked_ids);
			}
		});		
	});
}

/* getClosestTrip:
 * 	input:
 * 		trip_ids
 * 		date (Date)
 * 		callback (function(info))
 * 			info = {route, time}
 */

var getClosestTrip = function(trip_ids, stop_ids, date, callback){
	var cb = checkCallback(arguments);
	var trips = [];
	db.collection('stop_times', function(err, collection){
		collection.find({$and: [{trip_id: {$in: trip_ids}}, {stop_id: {$in: stop_ids}}]}).toArray(function(err, docs){
			docs.forEach(function(doc){
				var arrival = new Date();
				var timeStringArray = doc.arrival_time.split(":");
				arrival.setHours(timeStringArray[0]);
				arrival.setMinutes(timeStringArray[1]);
				arrival.setSeconds(timeStringArray[2]);
				var difference = arrival-date;
				if(difference >= 0){
					var t = {};
					t.time = difference;
					t.trip_id = doc.trip_id;
					t.arrivalTime = doc.arrival_time;
					insertMin(t, trips, 3);
				}
			});
			if(cb){
				cb(trips);
			}
		});
	});
}

var insertMin = function(item, stack, size){
	if(stack.length === 0){
		stack.push(item);
		return;
	}
	var a = stack.pop();
	if(item.time < a.time){
		insertMin(item, stack, size);
		if(stack.length < size){
			stack.push(a);
		}
	} else {
		stack.push(a);
		if(stack.length < size){
			stack.push(item);
		}
	}
}

var getTripInfo = function(trip, stop_id, callback){
	var cb = checkCallback(arguments);
	var routeNumber;
	var routeSign;
	var route_id;
	
	async.waterfall([
		function(c){
			db.collection('trips', function(err, collection){
				c(err, collection);
			});
		},
		function(collection, c){
			collection.findOne({trip_id: trip.trip_id}, function(err, doc){
				routeSign = doc.trip_headsign;
				route_id = doc.route_id;
				c(err, doc);
			});
		},
		function(doc, c){
			db.collection('routes', function(err, collection){
				c(err, collection);
			});
		},
		function(collection, c){
			collection.findOne({route_id: route_id}, function(err, doc){
				trip.number = doc.route_short_name;
				trip.direction = routeSign;
				c(err, trip);
			});
		}], function(err, trip){
			if(cb){
				cb(trip);
			}
		}
	);
}

var testLookup = function(stopid){
	var route_id;
	var trip_id;
	
	db.collection('routes', function(err, collection){
		collection.find({route_short_name: 92}, {route_id: 1, _id: 0}).toArray(function(err, docs){
			route_id = docs;
			db.collection('trips', function(err, collection){
				collection.find({$or: route_id, service_id: "1_merged_70541"}, {trip_id: 1, _id: 0}).toArray(function(err, docs){
					trip_id = docs;
					db.collection('stop_times', function(err, collection){
						collection.find({$or: trip_id, stop_id: stopid}, {arrival_time: 1}, {sort: [['arrival_time',1]]}).toArray(function(err, docs){
							console.log(docs);
						});
					});
				});
			});
		});
	});
}

var prettify = function(trips){
	if(trips.length === 0){
		console.log("No more busses today :(");
		return;
	}
	trips.forEach(function(trip){
		console.log(trip.number + " - " + trip.direction);
		if((trip.time/1000/60).toFixed() === 0){
			console.log("Now arriving");
		} else {
			console.log("Arriving in: " + (trip.time/1000/60).toFixed() + " minutes");
		}
		console.log("-----");
	});
}

var nextBus = function(alias, route, inbound, date, name, callback){
	var cb = checkCallback(arguments);
	var stop_ids;
	var service_ids;
	var route_ids;
	
	async.waterfall([
		function(c){
			aliasLookup(alias, inbound, function(stopids){
				console.log(stopids);
				stop_ids = stopids;
				c(null);
			});
		},
		function(c){
			if(route){
				getRouteIds(route, function(routeids){
					route_ids = routeids;
					c(null);
				});
			} else {
				c(null);
			}
		},
		function(c){
			getServiceIds(new Date(), function(serviceids){
				console.log(serviceids);
				service_ids = serviceids;
				c(null, stop_ids);
			});
		},
		function(stopids, c){
			getTripIds(stopids, function(tripids){
				console.log("Trips that stop here: " + tripids.length);
				c(null, tripids, service_ids);
			});
		},
		function(tripids, serviceids, c){
			checkTrips(tripids, serviceids, route_ids, function(checkedids){
				console.log("Trips that stop here today: " + checkedids.length);
				var d;
				if(date){
					d = date;
				} else {
					d = new Date();
				}
				c(null, checkedids, stop_ids, d);
			});
		},
		function(checkedids, stopids, date, c){
			getClosestTrip(checkedids, stopids, date, function(trips){
				//SEND TEXT REPLY!
				//console.log(trips);
				var counter = 0;
				var length = trips.length;
				if(trips.length === 0){
					sendText(trips);
				}
				
				trips.forEach(function(trip){
					getTripInfo(trip, function(){
						counter++;
						if(counter === length){
							//console.log(trips);
							sendText(trips, name);
						}
					});
				});
			});
		}])
	}


var sendText = function(trips, name){
	var msg = '';
	msg += "Hi " + name + "!\n";
	if(trips.length === 0){
		msg = "No more busses today :(";
	} else {
		trips.forEach(function(trip){
			msg += trip.number + " - " + trip.direction + '\n';
			if((trip.time/1000/60).toFixed() === 0){
				msg += "Now arriving\m";
			} else {
				msg += "Arriving in: " + (trip.time/1000/60).toFixed() + " minutes" + '\n';
			}
			msg += "----\n";
		});
	}
	console.log(msg.length);
	/*
	nmo.sendTextMessage("14012503444", '14012191115', "testing", function(){
		console.log("sent!");
	});
	*/
}

var checkUser = function(number, callback){
	var cb = checkCallback(arguments);
	async.waterfall([
		function(c){
			db.collection('users', function(err, collection){
				c(err, collection);
			});
		},
		function(collection, c){
			collection.findOne({number: number}, function(err, doc){
				c(err, doc);
			});
		}], function(err, doc){
			if(cb){
				if(doc){
					cb(doc.short_name);
				} else {
					cb(null);
				}
			}
		});
}

var parseText = function(msg){
	var split = msg.split(' ');
	var result = {};
	switch(split.length){
		case 4:
			var time = split[3].split(":")
			if(time.length != 2){
				return;
			}
			date = new Date();
			date.setHours(parseInt(time[0]));
			date.setMinutes(parseInt(time[1]));
			date.setSeconds(0);
			result.date = date;
		case 3:
			if(split[2] === 'in'){
				result.inbound = true;
			} else if(split[2] === 'out'){
				result.inbound = false;
			} else {
				return;
			}
		case 2:
			result.route = parseInt(split[1]);
			if(isNaN(result.route)){
				return;
			}
		case 1:
			result.alias = split[0];
		}
	return result;
}

var run = function(msg, number){
	//var result = parseText("thayer 92 in 20:00");
	var n;
	async.waterfall([
		function(c){
			checkUser(number, function(name){
				if(name){
					n = name;
					c(null);
				} else {
					console.log("Unauthorized user");
				}
			});
		},
		function(c){
			var result = parseText(msg);
			c(null, result)
		},
		function(result, c){
			nextBus(result.alias, result.route, result.inbound, result.date, n);
		}
	]);
}

exports.run = run;

/*
setTimeout(function(){
	//testLookup(16645);
	//var d = new Date();
	//d.setHours(8);
	//d.setMinutes(0);
	//var result = parseText("thayer 92 in 20:00");
	//nextBus(result.alias, result.route, result.inbound, result.date);
	nmo.initialize('7daa0795', '92e1ebea', 'http', false);
	nmo.sendTextMessage("14012503444", '14012191115', "testing", function(){
		console.log("sent!");
	});
}, 100);
*/
