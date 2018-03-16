# Pomegranate Task Utilities

Provides helper functions for working with `Pomegranate-Task-Runner`

### Install

``` shell
yarn add pomegranate pomegranate-task-utilities
# Or..
npm i -S pomegranate pomegranate-task-utilities
```

## Configuration

This plugin exposes 1 configuration option. `queues`

``` javascript

exports.TaskUtilities = function(Env){
  return {
    queues: [
      {
        propName: 'Tasks',
        queueName: Env.TASK_QUEUE_NAME,
        type: 'queue',
        RPC: {
          enabled: true,
          defaultTimeout: 1000
        },
        msgOptions: {
          persistent: true
        },
        queueOptions: {}
      }
    ]
  }
}

```

## Usage

Soon...

## Detailed Documentation

