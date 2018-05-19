var bebop = require('node-bebop');
var WebSocketServer = require('ws').Server;

var wss = new WebSocketServer({ port: 8181 });
// var drone = bebop.createClient();
var drone = bebop.createClient({ ip : '192.168.43.111' });

var navdata = {
	roll : 0,
	yaw : 0,
	pitch : 0,

	altitude : 0,

	latitude : 0,
	longitude : 0,

	battery : 0,
};

wss.on('connection', function (ws) {

	console.log('client connected');

	wssconnected = true;

	drone.connect(function() {
		drone.GPSSettings.resetHome();
	  
		drone.on("AttitudeChanged", function(data) {
			navdata.roll = data.roll;
			navdata.pitch = data.pitch;
			navdata.yaw = data.yaw;
			console.log(data);
	  
		  if (wssconnected === true) {
			//   console.log(JSON.stringify(navdata));
			  ws.send(JSON.stringify(navdata));
		  }
		});
	  
		drone.on("AltitudeChanged", function(data) {
			navdata.altitude = data.altitude;
			console.log(data);
	  
		  if (wssconnected === true) {
			//   console.log(JSON.stringify(navdata));
			  ws.send(JSON.stringify(navdata));
		  }
		});
		  
		drone.on("PositionChanged", function(data) {
			navdata.latitude = data.latitude;
			navdata.longitude = data.longitude;
			console.log(data);
	  
		  if (wssconnected === true) {
			//   console.log(JSON.stringify(navdata));
			  ws.send(JSON.stringify(navdata));
		  }
		});
	  
		drone.on("BatteryStateChanged", function(data) {
			navdata.battery = data.percent;
			console.log(data);
	  
		  if (wssconnected === true) {
			//   console.log(JSON.stringify(navdata));
			  ws.send(JSON.stringify(navdata));
		  }
		});
	  });

    ws.on('message', function (msg) {
    	var data = JSON.parse(msg);

		if ("order" in data) {
	    	if (data.order === "takeoff") {
	      		drone.takeoff();
				console.log('takeoff');
	    	} else if (data.order === "land") {
	      		drone.land();
				console.log('landoff');
	    	} else {
	      		console.log("order invalid. ");
	    	}
	  	} else if ("x" in data) {
	  		if (data.x > 0) {
	  			drone.forward(data.x * 100);
				console.log('move front');
	  		} else if (data.x < 0) {
	  			drone.backward(-data.x * 100);
	  			console.log('move back');
	  		} else {
	  			drone.forward(0); drone.backward(0);
	  			console.log('Reset front back');
	  		}

	  		if (data.y > 0) {
	  			drone.left(data.y * 100);
	  			console.log('move left');
	  		} else if (data.y < 0) {
	  			drone.right(-data.y * 100);
	  			console.log('move right');
	  		} else {
	  			drone.left(0); drone.right(0);
	  			console.log('Reset left right');
	  		}
	  	} else if ("alt" in data) {
	  		if (data.alt > 0) {
	  			drone.up(data.alt * 100);
	  			console.log('Move up');
	  		} else if (data.alt < 0) {
	  			drone.down(-data.alt * 100);
	  			console.log('Move down');
	  		} else {
	  			drone.up(0); drone.down(0);
	  			console.log('Reset up down');
	  		}

		  	if (data.yaw < 0) {
		  		drone.counterClockwise(-data.yaw * 100);
		  		console.log('Move counterClockwise');
		  	} else if (data.yaw > 0) {
		  		drone.clockwise(data.yaw * 100);
		  		console.log('Move Clockwise');
		  	} else {
		  		drone.counterClockwise(0);	drone.clockwise(0);
		  		console.log('Reset Clockwise');
		  	}
		} else {
	   		console.log("Command Data invalid. ");
	  	}   
	});
});


wss.on('close', function (ws) {
	wssconnected = false;
});