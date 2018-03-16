/**
 * @file TaskBuilder
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";

const _fp = require('lodash/fp')

const builder = new WeakMap()
const priv = function (thisArg) {
  if (!builder.has(thisArg))
    builder.set(thisArg, {});
  return builder.get(thisArg);
}

class TaskBuilder{
  constructor(){
    this.taskNameSet = false
    this.notifySet = false
    this.notifyNameSet = false
    this.notifyQueueSet = false

    let builderObj = {
      payload: {}
    }


    priv(this).builder = builderObj
  }

  _notifierState(){
    if(!this.notifySet){
      let b = priv(this).builder
      b.notify = {
        payload: {}
      }
      this.notifySet = true
    }
  }

  task(taskName){
    if(!taskName) throw new Error('Requires a task name, e.g. my.awesome.task.')
    if(!_fp.isString(taskName)) throw new Error('Task name must be a string.')

    let b = priv(this).builder
    b.taskName = taskName
    this.taskNameSet = true
    return this
  }

  notifyTask(notifierTaskName){
    if(!notifierTaskName) throw new Error('Requires a notify task name, e.g. my.notify.task.')
    if(!_fp.isString(notifierTaskName)) throw new Error('Notify task name must be a string.')

    let b = priv(this).builder

    this._notifierState()
    b.notify.taskName = notifierTaskName
    this.notifyNameSet = true
    return this


  }
  notifyQueue(queueName){
    if(!queueName) throw new Error('.notifyQueue(queueName) - Requires a queueName param, e.g. some.rmq.queue.')
    if(!_fp.isString(queueName)) throw new Error('notify queueName name must be a string.')
    let b = priv(this).builder

    this._notifierState()
    b.notify.queueName = queueName
    this.notifyQueueSet = true
    return this
  }
  payloadProp(prop, val){
    priv(this).builder.payload[prop] = val
    return this
  }

  notifyProp(prop, val){
    let p = priv(this).builder
    this._notifierState()
    p.notify.payload[prop] = val
    return this
  }

  build(prop){
    if(!this.taskNameSet) throw new Error('Task name is not set.')
    if(this.notifySet){
      if(!this.notifyNameSet){
        throw new Error('Notifier task name is not set.')
      }
      if(!this.notifyQueueSet){
        throw new Error('Notifier queue name is not set.')
      }
    }
    if(prop){
      return priv(this).builder[prop]
    }
    return priv(this).builder
  }
}

module.exports = TaskBuilder