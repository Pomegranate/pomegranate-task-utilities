/**
 * @file WriterFacade
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const Promise = require('bluebird')
const _ = require('lodash')
const WriteRPC = require('./WriteRPC')
const WriteTask = require('./WriteTask')
const WriteExchange = require('./WriteExchange')
const WeakWriters = new WeakMap()

/**
 *
 * @module WriterFacade
 */

function deferErrorToPromise(param) {
  return () => {
    return Promise.reject(new Error(`Parameter or queuename "${param}" not found in AddTask.use().`))
  }
}

class WriterFacade {
  constructor(queueList, exchangeList, channel, Logger) {
    this.channel = channel
    this.Logger = Logger
    this.initialized = false

    this.qmap = new Map() //keyed by queuename
    this.pmap = new Map() //keyed by config propName

    _.each(exchangeList, (q) => {
      if(this.qmap.has(q.exchangeName)) {
        throw new Error(`Duplicate ExchangeName "${q.exchangeName}" in AddTask exchanges configuration.`)
      }
      if(this.pmap.has(q.propName)) {
        throw new Error(`Duplicate PropName "${q.propName}" in AddTask exchanges configuration.`)
      }
      this.qmap.set(q.exchangeName, q)
      this.pmap.set(q.propName, q)
      this.addWriter(q)
    })

    _.each(queueList, (q) => {
      if(this.qmap.has(q.queueName)) {
        throw new Error(`Duplicate Queuename "${q.queueName}" in AddTask queues configuration.`)
      }
      if(this.pmap.has(q.propName)) {
        throw new Error(`Duplicate PropName "${q.propName}" in AddTask queues configuration.`)
      }
      this.qmap.set(q.queueName, q)
      this.pmap.set(q.propName, q)
      this.addWriter(q)
    })
  }

  addWriter(config) {
    let writer
    console.log(config.type)

    if(!_.has(config, 'type')) {
      throw new Error('Provided config must have type: queue, direct, fanout, topic, or headers.')
    }

    let ct = config.type

    if(ct === 'queue') {
      if(!_.has(config, 'queueName') || !_.has(config, 'propName')) {
        throw new Error('Provided config must include propName and queueName')
      }
      if(config.RPC.enabled) {
        writer = new WriteRPC(config, this.channel)
        this.Logger.log(`Queue: '${writer.queue}', Param: '${writer.propName}', loading. RPC: enabled`)
      }
      else {
        writer = new WriteTask(config, this.channel)
        this.Logger.log(`Queue: '${writer.queue}', Param: '${writer.propName}', loading. RPC: disabled`)
      }
    }

    if(ct === 'direct' || ct === 'fanout' || ct === 'topic' || ct === 'headers'){
      writer = new WriteExchange(config, this.channel)
      this.Logger.log(`Exchange: '${writer.exchange}', Param: '${writer.propName}', loading.`)
    }

    WeakWriters.set(config, writer)
    return this
  }

  initialize() {
    return Promise
      .map(this.pmap.values(), (c) => {
        return WeakWriters.get(c)
      })
      .filter((w) => {
        return !w.queueAsserted
      })
      .map((w) => {
        this.Logger.log(`Asserting queue - '${w.queue}' on param '${w.propName}'.`)
        return w.initialize()
      })
      .then((w) => {
        _.each(w, (l) => {

          if(_.isObject(l.taskQueue)) {
            this.Logger.log(`Queue - '${l.taskQueue.queue}' ready for messages.`)
            this.Logger.log(`RPC Queue - '${l.replyQueue.queue}' listening for replies.`)
            return
          }

          this.Logger.log(`Queue - '${l.queue}' ready for messages.`)
        })
        return this
      })

  }

  use(param) {
    if(this.pmap.has(param)) {
      return WeakWriters.get(this.pmap.get(param))
    }
    if(this.qmap.has(param)) {
      return WeakWriters.get(this.qmap.get(param))
    }
    return {
      call: deferErrorToPromise(param),
      write: deferErrorToPromise(param)
    }
  }

}

module.exports = WriterFacade