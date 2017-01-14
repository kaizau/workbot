'use strict';

const Slapp = require('slapp')
const Context = require('slapp-context-beepboop')
const ConvoStore = require('slapp-convo-beepboop')
const Chronos = require('../lib/chronos')

const slapp = Slapp({
  verify_token: process.env.SLACK_VERIFY_TOKEN,
  convo_store: ConvoStore(),
  context: Context(),
  log: true
})

const chronos = Chronos({
  beepboop_project_id: process.env.BEEPBOOP_PROJECT_ID,
  beepboop_token: process.env.BEEPBOOP_TOKEN,
})

function schedule(msg, minutes, event, payload, callback) {
  const sendAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
  chronos.scheduleSyntheticEvent(msg, sendAt, event, payload, callback)
}

module.exports = {slapp, schedule}
