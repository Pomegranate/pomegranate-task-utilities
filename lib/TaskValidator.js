/**
 * @file ./lib/TaskValidator.js
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate Task Utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";

// const builder = new WeakMap()
const _ = require('lodash')

/**
 * @class TaskValidator
 * @example
 * let valid = new TaskValidator(Data)
 *  .payload(['some', 'paths'])
 *  .notify(['other', 'paths'])
 *  .validate()
 */
class TaskValidator {
  /**
   * The Data object to validate
   * @param {Object} data
   */
  constructor(data){
    this.Errors = []
    if(!data) {throw new Error('Payload arg is required.')}
    this.data = data
    this.payloadPaths = null
    this.notifyPaths = null
  }

  /**
   * Add paths required
   * @param {Array[string]} paths - Object paths
   * @returns {TaskValidator}
   */
  payload(paths){
    if(!_.has(this.data, 'payload')){
      this.Errors.push(new Error('No payload path in this object'))
    }
    this.payloadPaths = paths
    return this
  }

  /**
   *
   * @param {Array[string]} paths - Object paths
   * @returns {TaskValidator}
   */
  notify(paths){
    if(!_.has(this.data, 'notify')){
      this.Errors.push(new Error('No notify path in this object'))
    }
    this.notifyPaths = paths
    return this
  }

  /**
   * Validates the object under test.
   * @param {Object} logger - Pass in a logger to use when outputting errors.
   * @returns {boolean} - Does the supplied object contain the paths provided.
   */
  validate(logger){
    if(this.payloadPaths){
      this.payloadPaths.forEach((v,k) => {
        if(!_.has(this.data.payload, v)) {
          this.Errors.push(new Error(`Key ${v} missing from supplied object.`))
        }
      })
    }
    if(this.notifyPaths){
      this.notifyPaths.forEach((v,k) => {
        if(!_.has(this.data.notify, v)) {
          this.Errors.push(new Error(`Key ${v} missing from supplied object.`))
        }
      })
    }
    if(this.Errors.length && logger){
      this.Errors.forEach((v) => {
        logger.error(v.message)
      })
    }
    return !(this.Errors.length)
  }
}


module.exports = TaskValidator