#!/bin/bash
set -e

npm install --legacy-peer-deps

npm run migrate
