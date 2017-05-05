/**
 * @file AddTask
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const Promise = require('bluebird')
const _ = require('lodash')
/**
 *
 * @module AddTask
 */

class WriteQueue {
  constructor(config, channel){
    this.channel = channel
    this.queue = config.queueName
    this.type = config.type
    this.options = config.options || null
  }

  write(msg, options){
    return Promise.try(() => {
      let strung = JSON.stringify(msg)
      let buf = Buffer.from(strung)
      let localOptions = options || this.options
      return this.channel.sendToQueue(this.queue, buf, localOptions)
    })
  }
}

module.exports = function(queueList, channel, Logger){
  return Promise.try(function(){
    let QueueWriters = {}
    _.each(queueList, function(config) {

      if(!_.has(config, 'queueName') || !_.has(config, 'propName') || !_.has(config, 'type')){
        throw new Error('Provided config must include propName, queueName and type.')
      }

      let writer = new WriteQueue(config, channel)
      Logger.log(`"${config.propName}" will be loaded and available at AddTask.${config.propName}`)
      QueueWriters[config.propName] = writer
    })
    return QueueWriters
  })
}