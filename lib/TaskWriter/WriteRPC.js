/**
 * @file WriteRPC
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const RMQWriter = require('./RMQWriter')
const Promise = require('bluebird')
const _ = require('lodash')
const UUID = require('uuid')
const defer = require('./defer')
/**
 *
 * @module WriteRPC
 */



class WriteRPC extends RMQWriter {
  constructor(config, channel){
    super(config, channel)
    this.RPCTimeout = config.RPC.defaultTimeout
    this.expireRemote = this.RPCTimeout + (this.RPCTimeout / 2)
    this.replyQueue = null
    this.callbacks = new Map()
  }

  call(msg, options){

    let localOptions = {
      expiration: options.timeout ? options.timeout + (options.timeout / 2) : this.expireRemote,
      correlationId: UUID.v4(),
      replyTo: this.replyQueue
    }
    console.log(localOptions);
    let deferred = defer()

    this.callbacks.set(localOptions.correlationId, deferred)

    return this.write(msg, localOptions)
      .then(() => {

        setTimeout(() => {
          this.callbacks.delete('woot')
          deferred.reject(new Error('This RCP timed out.'))
        },options.timeout || this.RPCTimeout)

        return deferred.promise
      })
  }

  initialize(){
    return Promise.props({
        replyQueue: this.channel.assertQueue('', {exclusive: true, autoDelete: true}),
        taskQueue: this.channel.assertQueue(this.queue, this.queueOptions)
    })
      .then((qs) => {
        this.replyQueue = qs.replyQueue.queue

        return this.channel.consume(this.replyQueue, (msg)=>{
          let correlationId = msg.properties.correlationId
          if(this.callbacks.has(correlationId)){
            let p = this.callbacks.get(correlationId)
            this.callbacks.delete(correlationId)
            p.resolve(msg.content.toString())
          }
        }, {noAck: true})

      })
      .then((s) => {
        return s
      })
  }
}

module.exports = WriteRPC