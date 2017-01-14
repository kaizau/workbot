'use strict'

require('dotenv').config()
const express = require('express')
const {slapp} = require('./src/app')

const port = process.env.PORT || 3000
const server = slapp.attachToExpress(express())

// TODO
// Add help
// https://github.com/BeepBoopHQ/in-or-out/blob/master/src/flows/help.js
require('./src/cycles');
require('./src/debrief');

server.listen(port, (err) => {
  if (err) { return console.error(err) }
  console.log(`Listening on port ${port}`)
})
