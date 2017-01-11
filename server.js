'use strict'

const express = require('express')
const Slapp = require('slapp')
const Context = require('slapp-context-beepboop')
const ConvoStore = require('slapp-convo-beepboop')
const Chronos = require('./lib/chronos')
const {startResponse, planning, debrief} = require('./src/messages')

require('dotenv').config()
var port = process.env.PORT || 3000

const slapp = Slapp({
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  convo_store: ConvoStore(),
  context: Context(),
  log: true
})

const server = slapp.attachToExpress(express())

const app = {
  slapp,
  server,
  chronos: Chronos({
    beepboop_project_id: process.env.BEEPBOOP_PROJECT_ID,
    beepboop_token: process.env.BEEPBOOP_TOKEN,
  })
}

slapp.message('^start', ['direct_mention', 'direct_message'], startWorkCycle)
slapp.command('/work', /^\s*start\s*$/, startWorkCycle)

//
// Plan Cycle
//

function startWorkCycle(msg) {
  msg
    .say(startResponse)
    .say(planning[0])
    // TODO TESTING
    //.route('planning1')
    .route('planning4')
}

slapp.route('planning1', msg => {
  msg
    .say(planning[1])
    .route('planning2')
})

slapp.route('planning2', msg => {
  msg
    .say(planning[2])
    .route('planning3')
})

slapp.route('planning3', msg => {
  msg
    .say(planning[3])
    .route('planning4')
})

slapp.route('planning4', msg => {
  msg
    .say(planning[4])

  schedule(msg, 1, 'start_debrief', {}, (error, task) => {
    if (error) { console.log(error) }
  })
})

//
// Debrief Cycle
//

// TODO
// For some reason, routes are not followed from this scheduled
// event. Perhaps something needs to be passed in the schedule()
// payload to persist? Alternatively, there could be a default
// expiration for routes. You'd expect this to start a new route,
// so perhaps I can ensure that.
slapp.event('start_debrief', msg => {
  console.log('> starting debrief!')
  msg
    .say(debrief[0])
    .route('debrief1')

  console.log('> routed to 1')
})

slapp.route('debrief1', msg => {
  console.log('>> 1!')
  msg
    .say(debrief[1])
    .route('debrief2')
})

slapp.route('debrief2', msg => {
  msg
    .say(debrief[2])
    .route('debrief3')
})

slapp.route('debrief3', msg => {
  msg
    .say(debrief[3])
    .route('debrief4')
})

slapp.route('debrief4', msg => {
  msg
    .say(debrief[4])
})

function schedule(msg, minutes, event, payload, callback) {
  const sendAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
  app.chronos.scheduleSyntheticEvent(msg, sendAt, event, payload, callback)
}

// Start
server.listen(port, (err) => {
  if (err) { return console.error(err) }
  console.log(`Listening on port ${port}`)
})
