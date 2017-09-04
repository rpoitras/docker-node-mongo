'use strict'

const express = require('express')
const app = express()
const http = require('http')
const StompServer = require('stomp-broker-js')
const mongoose = require('mongoose')

mongoose.connect('mongodb://mongo:27017')

app.get('/', function(req, res){
  res.send('Express server says hello\n')
})

const server = http.createServer()
const stompServer = new StompServer({
  server: server,
  path: '/portfolio'
})

server.listen(3000, function (err) {
  if (err) {
    return console.error(err.message)
  }
  console.log('Stomp server listening on port 3000')
})

stompServer.subscribe("/**", function(msg, headers) {
  const topic = headers.destination
  console.log('subscribe headers: ', headers)
  console.log(topic, "->", msg)
  let name = 'unknown'
  try {
    // remove anything not part of the printable ASCII range
    let a = JSON.parse(msg.replace(/[^ -~]+/g, ''))
    name = a.name
  } catch (e) {
    console.error('Problems parsing ' + msg)
    console.error(e.message)
  }
  let response = {'content': 'Hello ' + name + '!'}
  stompServer.send('/topic/greetings', {}, JSON.stringify(response))
})

stompServer.on("subscribe", function (id, sessionId, topic, tokens, socket) {
  console.log('Client subscribed: ')
  console.log('   ID ............', id.id)
  console.log('   Session ID ....', id.sessionId)
  console.log('   topic .........', id.topic)
  console.log('   tokens ........', id.tokens)
})

stompServer.on("unsubscribe", function (id, sessionId, topic, tokens, socket) {
  console.log('Client unsubscribed:')
  console.log('   ID ............ ', id)
  console.log('   Session ID .... ', sessionId)
  console.log('   topic ......... ', topic)
})

stompServer.on("disconnected", function (sessionId) {
  console.log('Client disconnected, session ID: ', sessionId)
})

stompServer.on("connected", function (sessionId, headers) {
  console.log('Client connected, session ID: ', sessionId)
  console.log('Client connected, Headers: ', headers)
})
