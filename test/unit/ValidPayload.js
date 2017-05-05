/**
 * @file ValidPayload
 * @author Jim Bulkowski <jim.b@paperelectron.com>
 * @project pomegranate-task-utilities
 * @license MIT {@link http://opensource.org/licenses/MIT}
 */

"use strict";
const tap = require('tap')
const ValidPayload = require('../../lib/ValidPayload')

const testObj = {
  payload: {
    a: 'a',
    b: 'b',
    c: {
      f: 'f'
    }
  },
  notify: {
    payload: {
      c: 'c',
      d: 'd'
    },
    taskName: 'a.b.c'
  }
}

const fakeLogger = {
  error: () => {
  }
}


tap.test('Checks base property paths', (t) => {

  t.throws(function(){
    new ValidPayload()
  }, "Throws with no args.")

  let vp = new ValidPayload({Data: {}})

  t.ok(vp.Errors.length === 0, 'No errors with a Data prop')
  vp.payload()
  t.ok(vp.Errors.length === 1, 'one Error with no payload path')

  vp.notify()
  t.ok(vp.Errors.length === 2, 'two Errors with no notify path')
  t.end()
})

tap.test('Returns true with no checks.', (t) => {

  let vp = new ValidPayload({Data:testObj})
    .validate()

  t.ok(vp)
  t.end()
})

tap.test('Checks internal paths', (t) => {
  let vp = new ValidPayload(testObj)
  let valid = vp
    .payload(['a', 'b', 'c', 'c.f'])
    .notify(['payload.c', 'payload.d'])
    .validate(console)
  t.ok(vp.Errors.length === 0, 'No errors with payload and notify set.')
  t.ok(valid, 'Valid if all paths are present.')
  t.end()

})

tap.test('Checks internal paths', (t) => {

  let vp = new ValidPayload(testObj)
  let valid = vp
    .payload(['a', 'b', 'c', 'c.f'])
    .notify(['payload.c', 'payload.d'])
    .validate(console)
  t.ok(vp.Errors.length === 0, 'No errors with payload and notify set.')
  t.ok(valid, 'Valid if all paths are present.')
  t.end()

})


tap.test('Checks internal paths', (t) => {

  let vp = new ValidPayload(testObj)
  let valid = vp
    .payload(['a', 'b', 'c', 'c.f'])
    .notify(['payload.c', 'payload.d'])
    .validate()
  t.ok(vp.Errors.length === 0, 'No errors with payload and notify set.')
  t.ok(valid, 'Valid if all paths are present.')
  t.end()

})

tap.test('Notifies missing internal paths', (t) => {
  let testObj = {
    payload: {

    },
    notify: {
      taskName: 'a.b.c'
    }
  }

  let vp = new ValidPayload(testObj)
  let valid = vp
    .payload(['a', 'b', 'c', 'c.f'])
    .notify(['taskName','payload.c', 'payload.d'])
    .validate(fakeLogger)
  t.ok(vp.Errors.length === 6, '6 Errors from missing paths.')
  t.notOk(valid, 'Not valid if paths are missing.')
  t.end()

})