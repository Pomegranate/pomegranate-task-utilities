/**
 * @file WriteTask
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const RMQWriter = require('./RMQWriter')
const Promise = require('bluebird')
/**
 *
 * @module WriteTask
 */

class WriteTask extends RMQWriter {
  constructor(config, channel){
    super(config, channel)
    this.queue = config.queueName
    this.queueOptions = config.queueOptions || null
    this.queueAsserted = false
  }

  initialize(){
    return Promise.try(() => {
      if(this.queueAsserted) {
        throw new Error('This Method has already been called.')
      }
      return this.channel.assertQueue(this.queue, this.queueOptions)
    })
      .then((q) => {
        this.queueAsserted = true
        return q
      })

  }
}

module.exports = WriteTask