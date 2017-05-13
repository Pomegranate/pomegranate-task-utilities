/**
 * @file defer
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const Promise = require('bluebird')
/**
 *
 * @module defer
 */

module.exports = function defer(){
  let resolve, reject
  let promise = new Promise(function(_resolve, _reject){
    resolve = _resolve
    reject = _reject
  })
  return {
    resolve: resolve,
    reject: reject,
    promise: promise
  }
}