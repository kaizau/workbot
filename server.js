'use strict'

const express = require('express')
const Slapp = require('slapp')
const Context = require('slapp-context-beepboop')

var port = process.env.PORT || 3000

var slapp = Slapp({
  //verify_token: process.env.SLACK_VERIFY_TOKEN,
  //convo_store: ConvoStore(),
  context: Context(),
  log: true
})

slapp.message('^(hi|hello|hey).*', ['direct_mention', 'direct_message'], (msg, text, greeting) => {
  msg
    .say(`${greeting}, how are you?`)
    .route('handleHowAreYou')
})

slapp.route('handleHowAreYou', (msg) => {
  msg.say(['Me too', 'Noted', 'That is interesting'])
})

slapp.message('.*', ['direct_mention', 'direct_message'], (msg) => {
  if (Math.random() < 0.4) {
    msg.say([':wave:', ':pray:', ':raised_hands:'])
  }
})

// Start
var server = slapp.attachToExpress(express())
server.listen(port, (err) => {
  if (err) { return console.error(err) }
  console.log(`Listening on port ${port}`)
})
