// app url: https://pzem004t.herokuapp.com/
// dump data: https://pzem004t.herokuapp.com/getusagehistory

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

// var previousUsage = 0;
var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var snapshot = null;

// // Connect to database //////////////////////////////////////////////////////////////
// mongoose.connect("mongodb+srv://pzem004t_user:pzem004t_pass@pzemcluster.sgig3.mongodb.net/pzem004t_db?retryWrites=true&w=majority")
// let connection = mongoose.connection;
// let collection;
// connection.on('error', console.error.bind(console, 'connection error:'));
// connection.once('open', async function () {
//   collection  = connection.db.collection("pzem004t_collection"); // initialize collection for future use
// });

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
	console.log(snapshot);
})

// WebSocket /////////////////////////////////////////////////////////////////////////
const wss = new WebSocket.Server({ server: server })
wss.on('connection', function connection(ws) {
  console.log('websocket connection opened!')
  setInterval(function(){ // push mqtt data to browser every 500 ms.
    ws.send(msg)
  }, 500);
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

// app.get('/getusagehistory', (req, res) => {
//   //collection.find().sort({ _id: -1 }).limit(7).toArray(function(err, data){ // get only last 7 usage history
//   collection.find().sort({ _id: -1 }).limit(43800).toArray(function(err, data){ // No. of minutes in a month
//     console.log(data); // it will print your collection data
//     res.send(data)
//   });
//
// })

server.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});

// const job = schedule.scheduleJob('59 * * * * *', function(){ // update db every min
//   let ts = Date.now();
//   var myDate = new Date(ts).toLocaleDateString('en-US');
//   var myTime = new Date(ts).toLocaleTimeString('en-US');
//   console.log(myDate + " " + myTime);
//
//   try {
//     var obj = JSON.parse(msg)
//     let usage_till_today = parseFloat((obj.Energy).slice(0, -3));
//     // var today_usage = (usage_till_today - previousUsage).toFixed(3)
//     // previousUsage = usage_till_today
//
//     //console.log(`today's usage ${today_usage} and previous day usage: ${previousUsage}`);
//     //console.log(day + " " + hours + ":" + minutes)
//     let reading = new Reading({
//       timestamp: myDate + " " + myTime,
//       //timestamp: date + " " + hours + ":" + minutes + ":" + seconds,
//       energyUsage: usage_till_today
//     })
//     collection.insertOne(reading);
//   } catch {
//     console.log('ignoring payload!')
//   }
// });


