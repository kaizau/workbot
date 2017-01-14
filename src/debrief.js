'use strict';

const {slapp} = require('./app')

const debrief = [
  `Goal completed?`,
  `Were there any distractions?`,
  `Things to improve for next cycle?`,
  `Energy / morale?`,
  `Great job.`
]

slapp.event('start_debrief', msg => {
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
