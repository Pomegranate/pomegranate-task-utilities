/**
 * @file index
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const WriterFacade = require('./lib/TaskWriter/WriterFacade')
const _ = require('lodash')
/**
 *
 * @module index
 */

exports.options = {
  loadRpcReply: false,
  queues: [{
    propName: 'local',
    queueName: 'my.task.queue',
    type: 'queue' ,
    RPC: { enabled: false, defaultTimeout: 1000 },
    msgOptions: {persistent: true},
    queueOptions: {}
  }],
  exchanges: [
    {
      propName: 'fanout',
      exchangeName: 'my.fanout.exchange',
      type: 'fanout',
      msgOptions: {persistent: true},
      exchangeOptions: {}
    }
  ]
}

exports.metadata = {
  frameworkVersion: 6,
  name: 'TaskUtilities',
  type: 'dynamic',
  optional: ['RabbitConnection']
}

exports.plugin = {
  load: function(Options, Logger, Injector, inject, loaded) {

    let plugins = [
      {param: 'TaskBuilder', load: require('./lib/TaskBuilder')},
      {param: 'TaskValidator', load: require('./lib/TaskValidator')}
    ]

    let RabbitConnection = Injector.inject('RabbitConnection')
    if(RabbitConnection && Options.queues && Options.queues.length){
      return RabbitConnection.createChannel()
        .then((channel)=> {

          if(Options.loadRpcReply||_.some(Options.queues, {RPC: {enabled: true}})){
            Logger.log("RPC enabled queues found, will load - 'RpcReply'.")
            let rpcr = require('./lib/RpcReply')
            plugins.push({param: 'RpcReply', load: rpcr(channel)})
          }

          let wf = new WriterFacade(Options.queues,Options.exchanges, channel, Logger)
          plugins.push({param: 'AddTask', load: wf})
          return wf.initialize()
        })
        .then(function(dynamics){
          return plugins
        })
    }

    return plugins

  }
}