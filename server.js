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

const startString = '^\s*start\s*(\d*)'
slapp.message(startString, ['direct_mention', 'direct_message'], handleStart)
slapp.command('/work', startString, handleStart)

//
// Plan Cycle
//

// TODO
// If passed duration, jump straight into it.
// If not, show action prompt

function handleStart(msg, text, duration) {
  console.log(text, duration);
  msg.say(startResponse)

  if (!duration) {
    msg.say({
      text: '',
      attachments: [
        {
          text: 'How long of a cycle?',
          fallback: 'How long of a cycle?',
          callback_id: 'handleDuration',
          actions: [
            {name: 'answer', text: '30 minutes', type: 'button', value: 30},
            {name: 'answer', text: '45 minutes',  type: 'button',  value: 45},
            {name: 'answer', text: '60 minutes', type: 'button', value: 60},
            {name: 'answer', text: '90 minutes',  type: 'button',  value: 90}
          ]
        }
      ]
    }).route('handleDuration')
  } else {
    startPlanning(msg, duration)
  }
}

slapp.route('handleDuration', msg => {
  let duration;

  if (msg.type !== 'action') {
    console.log(msg)
    return
  } else {
    duration = msg.body.actions[0].value
  }

  msg
    .respond(msg.body.response_url, {
      text: '',
      delete_original: true
    })
    .say(`Okay, ${duration} minutes it is.`)

  startPlanning(msg, duration)
})

function startPlanning(msg, duration) {
  const state = {duration}
  console.log('STARTING', state)
  msg
    .say(planning[0])
    .route('planning1', state, 180)
}

slapp.route('planning1', (msg, state) => {
  msg
    .say(planning[1])
    .route('planning2', state, 180)
})

slapp.route('planning2', (msg, state) => {
  msg
    .say(planning[2])
    .route('planning3', state, 180)
})

slapp.route('planning3', (msg, state) => {
  msg
    .say(planning[3])
    .route('planning4', state, 180)
})

slapp.route('planning4', (msg, state) => {
  msg
    .say(planning[4])

  schedule(msg, parseInt(state.duration, 10), 'start_debrief', {
    conversation_id: msg.conversation_id,
    duration: state.duration
  }, (error, task) => {
    if (error) { console.log(error) }
  })
})

//
// Debrief Cycle
//

slapp.event('start_debrief', msg => {
  // Workaround a bug in Slapp Chronos where convo_id is mangled
  const payload = msg.body.payload
  msg.conversation_id = payload.conversation_id

  console.log(payload)
  msg
    .say(debrief[0])
    .route('debrief1', null, 180)
})

slapp.route('debrief1', msg => {
  msg
    .say(debrief[1])
    .route('debrief2', null, 180)
})

slapp.route('debrief2', msg => {
  msg
    .say(debrief[2])
    .route('debrief3', null, 180)
})

slapp.route('debrief3', msg => {
  msg
    .say(debrief[3])
    .route('debrief4', null, 180)
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
