/**
 * @file index
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project Pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

'use strict';
const TaskAdders = require('./lib/AddTask')
/**
 *
 * @module index
 */

exports.options = {
  queues: [{propName: 'local', queueName: 'my.task.queue', type: 'queue' , options: {persistent: true}}]
}

exports.metadata = {
  name: 'TaskUtilities',
  type: 'dynamic',
  optional: ['RabbitConnection'],
  provides: ['MachineLoader']
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
          return TaskAdders(this.options.queues, channel, this.Logger)
        })
        .then(function(taskadders){
          if(Object.keys(taskadders)){
            plugins.push({param: 'AddTask', load: taskadders})
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