# Game Off 2020 Mono-repo

Moon themed multiplayer destructicle terrain shooter

[![GitHub Action Workflow Status][github-actions-workflow-image]][github-actions-workflow-url]
[![GitHub Action Deploy Workflow Status][github-actions-deploy-workflow-image]][github-actions-deploy-workflow-url]

---

Information on the Jam:

https://itch.io/jam/game-off-2020

## Client

Hosted on GitHub Pages: https://game-off-2020.github.io/all/

### Dev Run

It will listen to the changes.

`npm run start:dev:client`

### Prod Build

`npm run build:prod:client`

## Server

Hosted on Glitch: https://game-off.glitch.me/

### Dev Run

First, you need to run the dev build that will listen to the changes and will build it and then you need to run the start in a separate cmd window. Upon changes, you need to manually restart the start command only.

-  `npm run build:dev:server`
-  `npm run start:dev:server`

### Prod Build

`npm run build:prod:server`

[github-actions-workflow-image]: https://github.com/Game-Off-2020/all/workflows/Default/badge.svg
[github-actions-workflow-url]: https://github.com/Game-Off-2020/all/actions

[github-actions-deploy-workflow-image]: https://github.com/Game-Off-2020/all/workflows/Deploy/badge.svg
[github-actions-deploy-workflow-url]: https://github.com/Game-Off-2020/all/actions
