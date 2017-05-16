/**
 * @file index
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const WriterFactory = require('./lib/TaskWriter/WriterFactory')
const _ = require('lodash')
/**
 *
 * @module index
 */

exports.options = {
  queues: [{
    propName: 'local',
    queueName: 'my.task.queue',
    type: 'queue' ,
    RPC: { enabled: false, defaultTimeout: 1000 },
    msgOptions: {persistent: true},
    queueOptions: {}
  }]
}

exports.metadata = {
  name: 'TaskUtilities',
  type: 'dynamic',
  optional: ['RabbitConnection']
}

exports.plugin = {
  load: function(inject, loaded) {

    let plugins = [
      {param: 'TaskBuilder', load: require('./lib/TaskBuilder')},
      {param: 'TaskValidator', load: require('./lib/ValidPayload')}
    ]

    let RabbitConnection = inject('RabbitConnection')
    if(RabbitConnection && this.options.queues && this.options.queues.length){
      return RabbitConnection.createChannel()
        .then((channel)=> {
          if(_.some(this.options.queues, {RPC: {enabled: true}})){
            this.Logger.log('RPC enabled queues found, will load "RpcReply".')
            let rpcr = require('./lib/RpcReply')
            plugins.push({param: 'RpcReply', load: rpcr(channel)})
          }
          return WriterFactory(this.options.queues, channel, this.Logger)
        })
        .then(function(dynamics){
          if(Object.keys(dynamics)){
            plugins.push({param: 'AddTask', load: dynamics})
          }
          loaded(null, plugins)
        })
        .catch((err) => {
          return loaded(err)
        })
    } else {
      loaded(null, plugins)
    }

  },
  start: function(done) {
    done()
  },
  stop: function(done) {
    done()
  }
}