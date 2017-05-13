/**
 * @file WriterFactory
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const Promise = require('bluebird')
const _ = require('lodash')
const WriteTask = require('./WriteTask')
const WriteRPC = require('./WriteRPC')
/**
 *
 * @module WriterFactory
 */

module.exports = function(queueList, channel, Logger){
  return Promise.try(function(){

    return Promise.map(queueList, function(config){
      if(!_.has(config, 'queueName') || !_.has(config, 'propName') || !_.has(config, 'type')){
        throw new Error('Provided config must include propName, queueName and type.')
      }

      let writer
      if(config.RPC.enabled){
        writer = new WriteRPC(config, channel)
        Logger.log(`"${writer.propName}" will be loaded and available at AddTask.${writer.propName}, RPC: enabled`)
      } else {
        writer = new WriteTask(config, channel)
        Logger.log(`"${writer.propName}" will be loaded and available at AddTask.${writer.propName}, RPC: disabled`)
      }

      // let writer = new WriteTask(config, channel)

      return writer.initialize()
        .then((q) => {
          return writer
        })
    })
      .then((writers) => {
        return _.keyBy(writers, 'propName')
      })
  })
}