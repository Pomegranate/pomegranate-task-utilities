/**
 * @file WriteExchange
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const RMQWriter = require('./RMQWriter')
const Promise = require('bluebird')
/**
 *
 * @module WriteExchange
 */

class WriteExchange extends RMQWriter {
  constructor(config, channel){
    super(config, channel)
    this.exchange = config.exchangeName
    this.queueOptions = config.exchangeOptions || null
    this.exchangeAsserted = false
  }

  initialize(){
    return Promise.try(() => {
        if(this.exchangeAsserted) {
          throw new Error('This Method has already been called.')
        }
        return this.channel.assertExchange(this.exchange, this.type, this.exchangeOptions)
      })
      .then((exchg) => {
        this.exchangeAsserted = true
        return exchg
      })

  }
  writeToExchange(exchangeName, msg, routingKey, options){
    return Promise.try(() => {
      let strung = JSON.stringify(msg)
      let buf = Buffer.from(strung)
      let localOptions = options || this.msgOptions
      return this.channel.publish(exchangeName, routingKey, buf, localOptions)
    })
  }
  publish(msg, routingKey = '', options){
    return this.writeToExchange(this.exchange, msg, routingKey, options)
  }
}

module.exports = WriteExchange