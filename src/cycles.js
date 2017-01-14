'use strict';

const {slapp, schedule} = require('./app')

const planning = [
  `What do you plan to accomplish this cycle?`,
  `How will you get started?`,
  `Are there hazards present?`,
  `How's your energy? Morale?`,
  `Noted. Cycle on!`
]

// Cancel via response or /work to cancel
function abortableRoute(route, callback) {
  slapp.route(route, (msg, state) => {
    let text
    if (msg.body.event && msg.body.event.text) {
      text = msg.body.event.text
    } else if (msg.body.text) {
      text = msg.body.text
    }

    if (text && /^(end|nvm|stop|abort|cancel)/.test(text)) {
      msg.cancel()
      msg.say('Okay, cancelled. Until next time.')
      return
    }

    callback(msg, state)
  })
}

slapp.message('(?:start|cycles?)\\s?(\\d*)', ['direct_mention', 'direct_message'], handleStart)
slapp.command('/work', '(?:start|cycles?)?\\s?(\\d+)', handleStart)

function handleStart(msg, text, duration) {
  duration = duration ? parseInt(duration, 10) : false

  // TODO Better handling of error cases
  if (!duration || isNaN(duration) || duration > 120) {
    msg.say({
      text: 'How long of a cycle?',
      attachments: [
        {
          text: 'Type your answer in minutes or choose from below:',
          fallback: 'Type your answer in minutes or choose from below:',
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

abortableRoute('handleDuration', msg => {
  let duration

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

abortableRoute('planning1', (msg, state) => {
  msg
    .say(planning[1])
    .route('planning2', state, 180)
})

abortableRoute('planning2', (msg, state) => {
  msg
    .say(planning[2])
    .route('planning3', state, 180)
})

abortableRoute('planning3', (msg, state) => {
  msg
    .say(planning[3])
    .route('planning4', state, 180)
})

abortableRoute('planning4', (msg, state) => {
  msg
    .say(planning[4])

  schedule(msg, state.duration, 'start_debrief', {
    duration: state.duration
  }, (error, task) => {
    if (error) { console.log(error) }
  })
})
