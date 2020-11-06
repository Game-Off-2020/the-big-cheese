# all

[![GitHub Action Workflow Status][github-actions-workflow-image]][github-actions-workflow-url]

## Client

### Dev Run

It will listen to the changes.

`npm run start:dev:client`

### Prod Build

`npm run build:prod:client`

## Server

### Dev Run

First, you need to run the dev build that will listen to the changes and will build it and then you need to run the start in a separate cmd window. Upon changes, you need to manually restart the start command only.

-  `npm run build:dev:server`
-  `npm run start:dev:server`

### Prod Build

`npm run build:prod:server`

[github-actions-workflow-image]: https://github.com/Game-Off-2020/all/workflows/Default/badge.svg
[github-actions-workflow-url]: https://github.com/Game-Off-2020/all/actions
