/**
 * @file RpcReply
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const Promise = require('bluebird')
const _ = require('lodash')

/**
 *
 * @module RpcReply
 */

module.exports = function(channel){
  return function RpcReply(msg, options){
    return Promise.try(()=>{
      if(!_.has(options, 'correlationId')){
        throw new Error('Reply metadata missing correlationId.')
      }
      if(!_.has(options, 'replyTo')){
        throw new Error('Reply metadata missing replyTo.')
      }
      let replyTo = options.replyTo
      let o = {correlationId: options.correlationId}
      let strung = JSON.stringify(msg)
      let buf = Buffer.from(strung)

      return channel.sendToQueue(replyTo, buf, o)
    })
  }
}