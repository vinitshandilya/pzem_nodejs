const express = require('express');
const http = require('http');
const path = require('path');
const WebSocket = require('ws');
const app = express();
let Reading = require('./models/reading');
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const schedule = require('node-schedule');

var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var snapshot = null;


// MQTT /////////////////////////////////////////////////////////////////////////////
const mqtt = require('mqtt');
const { read } = require('fs');
const res = require('express/lib/response');
const client  = mqtt.connect('mqtt://broker.hivemq.com:1883')
const subscribe_topic = 'outtopic' // pzem+esp would be publishing data over outtopic
client.on('connect', function () {
  client.subscribe(subscribe_topic, function (err) {
    if (!err) {
      //client.publish(subscribe_topic, `Waiting for electrical params on: ${subscribe_topic}!`)
    }
  })
})
var msg = ""
client.on('message', function (topic, message) {
  // message is Buffer
  //console.log(`Message arrived on ${topic}: ` + message.toString())
	msg = message.toString();
	snapshot = JSON.parse(msg);
	const currentDate = new Date();
	const unixTimestamp = Math.floor(currentDate.getTime() / 1000);
	snapshot.timestamp = unixTimestamp;
	console.log(snapshot);
})

// WebSocket /////////////////////////////////////////////////////////////////////////
const wss = new WebSocket.Server({ server: server })
wss.on('connection', function connection(ws) {
  console.log('websocket connection opened!')
  setInterval(function(){ // push mqtt data to browser every 1000 ms.
    ws.send(JSON.stringify(snapshot))
  }, 1000);
  ws.on('message', function incoming(data) {
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(data);
      }
    })
  })
})

// Routes
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index.html'));
});

app.get('/reading',function(req,res){
  res.status(200).json(snapshot);
});

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});


