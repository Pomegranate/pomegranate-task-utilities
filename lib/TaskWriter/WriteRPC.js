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
    this.queue = config.queueName
    this.queueOptions = config.queueOptions || null
    this.queueAsserted = false
    this.RPCTimeout = config.RPC.defaultTimeout
    this.expireRemote = this.RPCTimeout + (this.RPCTimeout / 2)
    this.replyQueue = null
    this.callbacks = new Map()
  }

  rpc(msg, options){

    let localOptions = {
      expiration: options.timeout ? options.timeout + (options.timeout / 2) : this.expireRemote,
      correlationId: UUID.v4(),
      replyTo: this.replyQueue
    }
    let deferred = defer()

    this.callbacks.set(localOptions.correlationId, deferred)

    return this.write(msg, localOptions)
      .then(() => {

        setTimeout(() => {
          this.callbacks.delete(localOptions.correlationId)
          deferred.reject(new Error(`RPC with correlationId "${localOptions.correlationId} timed out.`))
        },options.timeout || this.RPCTimeout)

        return deferred.promise
      })
  }

  reply(msg, options){
    let replyTo = options.replyTo
    delete options.replyTo
    return this.writeToQueue(replyTo, msg, options)
  }

  initialize(){
    return Promise.props({
        replyQueue: this.channel.assertQueue('', {exclusive: true, autoDelete: true}),
        taskQueue: this.channel.assertQueue(this.queue, this.queueOptions)
    })
      .then((qs) => {
        this.queueAsserted = true
        this.replyQueue = qs.replyQueue.queue

        this.channel.consume(this.replyQueue, (msg)=>{
          let correlationId = msg.properties.correlationId
          if(this.callbacks.has(correlationId)){
            let p = this.callbacks.get(correlationId)
            this.callbacks.delete(correlationId)

            try {
              return p.resolve(JSON.parse(msg.content.toString()))
            }
            catch(e){
              return p.reject(e)
            }


          }
        }, {noAck: true})

        return qs

      })
      .then((qs) => {

        return qs
      })
  }
}

module.exports = WriteRPC