// server.js
//
// A simple histogram for showing the WCETs of code running on an embedded microcontroller
// Where the uC sends the data to the server to be rendered via websockets
//
// author: stf

// for accessing server-side files
var http = require('http');
var https = require('https');
var fs = require('fs');

var path = require('path');
var cdir = process.cwd();

const WebSocket = require('ws');

// the express webserver
const express = require('express');
const app = express();

// All the library include files
app.get('/histo.js', (req, res) => res.sendFile(path.join(cdir+'/histo.js')));
app.get('/colourScheme.js', (req, res) => res.sendFile(path.join(cdir+'/colourScheme.js')));
app.get('/', (req, res) => res.sendFile(path.join(cdir+'/index.html')));

var httpServer = http.createServer(app);
httpServer.listen(4000);

// backend websocket server -- the uP connects here 
const be_wss = new WebSocket.Server({port: 1234});

// frontend websocket server -- the visualiser webpage connects here
const fe_wss = new WebSocket.Server({port: 1235});

// current default -- pass all messages from the backend to the frontend
// backend server logic
be_wss.on('connection', function connection(be_ws, be_req) {
    console.log('backend connection established  IP:' + be_req.socket.remoteAddress);
    be_ws.on('message', function incoming(message) {
        //console.log('received BE message %s', message);

        // forward the message onto all frontends
        fe_wss.clients.forEach(function each(client) {
            if(client !== fe_wss && client.readyState == WebSocket.OPEN){
                client.send(message);
            }
        });
    });
});

// Frontend messages to be sent to the simulation
fe_wss.on('connection', function connection(fe_ws) {
    console.log('frontend connection established');
    fe_ws.on('message', function incoming(message) {
        //console.log('received FE message %s', message);

        // forward the message onto all frontends
        be_wss.clients.forEach(function each(client) {
            if(client !== be_wss && client.readyState == WebSocket.OPEN){
                client.send(message);
            }
        });
    });
});

console.log("Server is running: http://localhost:4000");
