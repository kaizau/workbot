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

// TODO Add a help command

const startString = 'start (\\d*)'
slapp.message(startString, ['direct_mention', 'direct_message'], handleStart)
slapp.command('/work', startString, handleStart)

//
// Plan Cycle
//

function handleStart(msg, text, duration) {
  msg.say(startResponse)
  duration = duration ? parseInt(duration, 10) : false

  // TODO Better handling of error cases
  if (!duration || isNaN(duration) || duration > 120) {
    msg.say({
      text: 'How long of a cycle?',
      attachments: [
        {
          text: '',
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
    duration = parseInt(msg.body.event.text, 10)

    if (isNaN(duration)) {
      msg
        .say(`Pardon, I didn't get that. How many minutes would you like this cycle to last?`)
        .route('handleDuration')
      return
    } else if (duration > 120) {
      msg
        .say(`I admire your ambition, but shorter cycles tend to produce better results.`)
        .say(`Two hours is the maximum that I'd recommend. Try again?`)
        .route('handleDuration')
      return
    }
  } else {
    duration = parseInt(msg.body.actions[0].value, 10)
  }

  msg
    .respond(msg.body.response_url, {
      text: '',
      delete_original: true
    })

  startPlanning(msg, duration)
})

function startPlanning(msg, duration) {
  const state = {duration}
  msg
    .say(`Okay, ${duration} minutes it is.`)
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

  schedule(msg, state.duration, 'start_debrief', {
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
  const payload = msg.body.event.payload
  msg.conversation_id = payload.conversation_id

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
