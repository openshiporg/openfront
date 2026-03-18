#!/bin/bash
set -e

npm install --legacy-peer-deps

npx prisma migrate deploy
