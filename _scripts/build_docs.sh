#!/usr/bin/env bash

cat <(cat docs/readme_base.md) <(documentation build --shallow \
./lib/TaskValidator.js \
./lib/TaskBuilder.js \
./lib/RpcReply.js \
-f md) > README.md