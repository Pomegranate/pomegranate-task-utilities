/**
 * @file TaskBuilder
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";
const tap = require('tap')
const TaskBuilder = require('../../lib/TaskBuilder')

tap.test('Throws under a few circumstances.', (t) => {

  /*
   * .task is mandatory. If you try to call .build at the end
   * without calling this someplace first, it will throw.
   */
  t.test('With invalid arguments to .mailTask()', (tt) => {
    tt.throws(function(){
        let m = new TaskBuilder()
          .task()
      }, /Requires a task name, e.g. my.awesome.task./,
      'Throws when .task is called with no arg.')

    tt.throws(function(){
        let m = new TaskBuilder()
          .task([])
      }, /Task name must be a string./,
      'Throws when .task is called without a string arg -- array.')

    tt.throws(function(){
        let m = new TaskBuilder()
          .task({})
      }, /Task name must be a string./,
      'Throws when .task is called without a string arg -- object.')

    tt.throws(function(){
        let m = new TaskBuilder()
          .task(6)
      }, /Task name must be a string./,
      'Throws when .task is called without a string arg -- number.')

    tt.end()
  })

  /*
   * .notifyTask() is not mandatory, but if it somehow becomes unset before .build()
   * is called it will throw.
   */

  t.test('With invalid arguments to .notifyTask()', (tt) => {
    tt.throws(function(){
        let m = new TaskBuilder()
          .notifyTask()
      }, /Requires a notify task name, e.g. my.notify.task./,
      'Throws when .notifyTask is called with no arg.')

    tt.throws(function(){
        let m = new TaskBuilder()
          .notifyTask([])
      }, /Notify task name must be a string./,
      'Throws when .notifyTask is called without a string arg -- array.')

    tt.throws(function(){
        let m = new TaskBuilder()
          .notifyTask({})
      }, /Notify task name must be a string./,
      'Throws when .notifyTask is called without a string arg -- object.')

    tt.throws(function(){
        let m = new TaskBuilder()
          .notifyTask(6)
      }, /Notify task name must be a string./,
      'Throws when .notifyTask is called without a string arg -- number.')

    tt.end()
  })

  t.test('With .build() called without tasknames set.', (tt) => {

    tt.throws(function(){
      let m = new TaskBuilder()
        .build()
    }, /Task name is not set./, 'Throws when .build() is called without .task() set.')

    tt.throws(function(){
      let m = new TaskBuilder()
        .task('my.awesome.task')
        .notifyProp('a', 'b')
        .build()
    }, /Notifier task name is not set./, 'Throws when .build() is called without .notifyTask() set.')

    tt.end()
  })


  t.end()
})

tap.test('Does not throw under others.', (t) => {

  t.doesNotThrow(function(){
    let m = new TaskBuilder()
      .task('a.b.c')
      .build()
  }, 'Does not throw with a string arg.')

  t.doesNotThrow(function(){
    let m = new TaskBuilder()
      .task('a.b.c')
      .notifyTask('e.f.g')
      .build()
  }, 'Does not throw with a string arg.')

  t.end()
})

tap.test('Basic usage', (t) => {

  let m1 = new TaskBuilder()
    .task('my.awesome.task')
    .payloadProp('address', 'tom@example.com')
    .payloadProp('subject', 'Hello from us.')

  let m2 = new TaskBuilder()
    .task('my.awesome.task')
    .payloadProp('address', 'bob@example.com')
    .payloadProp('subject', 'Hello from us.')


  t.type(m1.build(), 'object', '.build returns an object.')
  t.type(m1.build('derp'), 'undefined', '.build(prop) with nox existent prop returns undefined.')

  t.equal(m1.build('payload').address, 'tom@example.com', 'Passing an existing property to build should return that property')
  t.equal(m2.build('payload').address, 'bob@example.com', 'Set properties on distinct object should be equal.')


  t.end()
})

tap.test('Adding a notifier object', (t) => {

  let m = new TaskBuilder()
    .task('my.awesome.task')
    .notifyTask('my.notify.task')
    .payloadProp('address', 'tom@example.com')
    .payloadProp('subject', 'Hello from us.')
    .notifyProp('userUUID', '123456')
    .notifyProp('values', ['updatedAt', 'emailSent'])
    .build()

  t.equal(m.notify.taskName, 'my.notify.task', 'Notify task name set correctly.')
  t.equal(m.taskName, 'my.awesome.task', 'Mail task name set correctly.')

  t.end()
})


tap.test('Execution order does not matter, other than build.', (t) => {
  let m = new TaskBuilder()
    .payloadProp('address', 'tom@example.com')
    .payloadProp('subject', 'Hello from us.')
    .notifyProp('userUUID', '123456')
    .notifyTask('my.notify.task')
    .notifyProp('values', ['updatedAt', 'emailSent'])
    .task('my.awesome.task')
    .build()

  t.equal(m.notify.taskName, 'my.notify.task', 'Notify task name set correctly.')
  t.equal(m.taskName, 'my.awesome.task', 'Mail task name set correctly.')

  t.end()
})

tap.test('Repeated calls to .notifyTask and .task are idempotent.', (t) => {
  let m = new TaskBuilder()
    .payloadProp('a','b')
    .notifyProp('a', 'b')
    .notifyTask('a.b.c')
    .notifyTask('a.b.c.d')
    .task('f.g.h.i.j.k.l.m')
    .notifyTask('a.b.c.d.e')
    .payloadProp('c','d')
    .notifyProp('c', 'd')
    .notifyTask('my.notify.task')
    .task('n.o.p.q')
    .task('my.awesome.task')
    .build()

  t.equal(m.notify.taskName, 'my.notify.task', 'Notify task name set correctly.')
  t.equal(m.taskName, 'my.awesome.task', 'Mail task name set correctly.')

  t.equal(m.payload.a, 'b', 'Properties remain set correctly.')
  t.equal(m.notify.payload.a, 'b', 'Properties remain set correctly.')
  t.equal(m.payload.c, 'd', 'Properties remain set correctly.')
  t.equal(m.notify.payload.c, 'd', 'Properties remain set correctly.')

  t.end()
})