'use strict'

require('dotenv').config()
const express = require('express')
const {slapp} = require('./src/app')

const port = process.env.PORT || 3000
const server = slapp.attachToExpress(express())

require('./src/cycles');
require('./src/debrief');

server.listen(port, (err) => {
  if (err) { return console.error(err) }
  console.log(`Listening on port ${port}`)
})
