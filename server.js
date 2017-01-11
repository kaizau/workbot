'use strict'

const express = require('express')
const Slapp = require('slapp')
const Context = require('slapp-context-beepboop')
const ConvoStore = require('slapp-convo-beepboop')

var port = process.env.PORT || 3000

var slapp = Slapp({
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  convo_store: ConvoStore(),
  context: Context(),
  log: true
})

const startResponse = [
  `Excellent. Let's get going.`,
  `Time to get down to business.`,
  `I was wondering when you'd ask.`,
  `Brilliant. Let's dive in.`,
  `Ready when you are.`
]

const planning = [
  `What do you plan to accomplish this cycle?`,
  `How will you get started?`,
  `Are there hazards present?`,
  `How's your energy? Morale?`,
  `Noted. Cycle on!`
]

const debrief = [
  `Goal completed?`,
  `Were there any distractions?`,
  `Things to improve for next cycle?`,
  `Energy / morale?`
]

slapp.message('^start', ['direct_mention', 'direct_message'], startWorkCycle)
slapp.command('/work', /^\s*start\s*$/, startWorkCycle)

function startWorkCycle(msg) {
  msg
    .say(startResponse)
    .say(planning[0])
    .route('planning1')
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
})

// Start
var server = slapp.attachToExpress(express())
server.listen(port, (err) => {
  if (err) { return console.error(err) }
  console.log(`Listening on port ${port}`)
})
