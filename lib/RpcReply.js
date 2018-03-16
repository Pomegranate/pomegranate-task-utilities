/**
 * @file ./lib/RpcReply.js
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const Promise = require('bluebird')
const _ = require('lodash')

module.exports = function(channel){

  /**
   * Formats and sends Remote Procedure Call replies.
   *
   * @param {Object} msg - And object that will be stringified.
   * @param {Object} options - RabbitMQ message options.
   * @param {string} options.correlationId - RMQ correlation ID
   * @param {string} options.replyTo - RMQ callback queue
   * @returns {Promise}
   * @constructor
   */
  function RpcReply(msg, options){
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

  return RpcReply
}