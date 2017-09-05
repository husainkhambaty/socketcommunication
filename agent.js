/* agent.js */

var net = require('net');
var EventEmitter = require("events").EventEmitter;
var events = new EventEmitter();

const uuid = require('uuid/v1');

// TODO : Go to utils or some other shared library
var createMessage = function(event, data) {
  return JSON.stringify({ event : event, data : data });
}


var client = new net.Socket();
client.connect(6969, 'localhost', function() {
	console.log("Connected to Master");
	client.write(createMessage("identify", { id : "123", name: "Husain" } ));
});

client.on('data', function(data) {
	events.emit(JSON.parse(data).event, JSON.parse(data).data);
});

client.on('close', function() {
	console.log('Connection closed');
});


// Setup the events
events
	.on("identified", function(data) {
	  console.log("I've been identified, YAY!");
	})

	.on("notidentified", function(data) {
		console.log("BOOO!!!");
	})
	.on("run", function(data) {
		console.log("Boss told me to run : " + data.command);

		// TODO : CMDRunner goes here

		client.write(createMessage("results", {results : "some shitty results"}));

	})
	.on("warmshutdown", function(data) {
		console.log("We have been told to shutdown in " + data.timeout + " seconds");
		setTimeout(function() {
			client.write(createMessage("shutdownok", {id : "123"}));
			client.destroy();
			console.log("Shutting down");
		}, data.timeout * 1000);
	})
	.on("shutdown", function(data) {
		console.log("Oh Boy! We need to shutdown NOW");
		client.write(createMessage("shutdownok", {id : "123"}));
		client.destroy();
	});