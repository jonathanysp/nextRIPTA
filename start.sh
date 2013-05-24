#!/bin/bash

./node_modules/forever/bin/forever start -al forever.log -ao logs/out.log -ae logs/err.log app.js
