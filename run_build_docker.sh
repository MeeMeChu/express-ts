#!/bin/bash

export VERSION=$(node -p "require('./package.json').version")

docker compose down && docker compose up -d --build