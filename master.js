/* master.js */

var net = require('net');
const util = require('util');
var EventEmitter = require("events").EventEmitter;

var events = new EventEmitter();

// TODO : Go to utils or some other shared library
var createMessage = function(event, data) {
  return JSON.stringify({ event : event, data : data });
}
var getClientSocket = function(client) {
  if (clients && clients.get(client)) {
    return (clients.get(client).socket || null);
  }
}

var NodeAgent = function(obj, socket) {
  this.id = obj.id;
  this.name = obj.name;
  this.address = obj.address;
  this.port = obj.port;
  this.socket = socket;
}

var port = 6969; // goes into default.json - master

// List of clients
var clients = new Map();

// Create the server
var server = net.createServer(function(socket) {

  socket.on('connect', function(data) {
    console.log("CONNECTEDO " + data);
  });

  socket.on('data', function(data) {
    var dataObj = JSON.parse(data);
    events.emit(dataObj.event, socket, dataObj.data); // Logic to recognize events based on the 'event' tag
    
  });

  socket.on('close', function(err) {
    console.log("CLOSED : ");
  });

  socket.on('timeout', function() {
    console.log("Socket timeout");
    socket.end();
  });

}).listen(port, 'localhost');
console.log("Master has started on " + port);


// server.on('connection', function(socket) {
  
// });

/* Events */
events
  // 1. identify (from client) Return "identified"
  .on("identify", function(socket, data) {
    // Check if this client is already added
    if (!clients.has(data.id)) {

      // Set the address and port
      data.address = socket.remoteAddress;
      data.port = socket.remotePort;

      clients.set(data.id, new NodeAgent(data, socket));
      console.log("Welcome " + JSON.stringify(data));

      socket.write(createMessage("identified"));
    }
    else {
      //events.emit("run", "123", "some shitty command");
      socket.write(createMessage("notidentified"));
      socket.end();
    }
  })

  // 2. run (from server) calls "run"
  .on("run", function(client, command) {
    var socket = getClientSocket(client);
    if (socket) socket.write(createMessage("run", { command : command }));

  })
  // 3. results (from client) Return "results"
  .on("results", function(socket, data) {
    console.log("Results : " + data.results);
  })
  .on("warmshutdown", function(client, timeout) {
    console.log("Shutting down");
    var socket = getClientSocket(client);
    if (socket) socket.write(createMessage("warmshutdown", { timeout : timeout })); // 5 second timeout before closing socket from client side
  })
  .on("shutdown", function(client) {
    var socket = getClientSocket(client);
    if (socket) socket.write(createMessage("run"));
  })
  .on("shutdownok", function(socket, data) {
    console.log("Shutdown confirmed for " + data.id);
    socket.end();
  });

console.log("Starting some work");
var cnt = 1;
var c = setInterval(function() {
    events.emit("run", "123", "some shitty command " + (cnt++));
    console.log(cnt);
}, 5000);

setTimeout(function() {
  clearInterval(c);
  events.emit("warmshutdown", "123", "5");
},22000)
