# The Big Cheese

Moon themed multiplayer destructible terrain shooter for Game Off 2020 on Itch.io

[![GitHub Action Workflow Status][github-actions-workflow-image]][github-actions-workflow-url]
[![GitHub Action Deploy Workflow Status][github-actions-deploy-workflow-image]][github-actions-deploy-workflow-url]

---

Live demo: https://game-off-2020.github.io/the-big-cheese/
Itch.io Page: https://dolanmiu.itch.io/the-big-cheese
Information on the Jam: https://itch.io/jam/game-off-2020

## Technologies used

-  Game Engine: Phaser 3 - https://phaser.io/
-  Language: Typescript
-  Back-end: Node.js
-  Websockets: Socket IO - https://socket.io/
-  CD/CD: Github Actions
-  Bundling: Webpack
-  Hosts: GitHub Pages, Heroku, Glitch, Itch.io
-  Art: Photoshop and sources down below
-  Sounds: Logic X and sources down below

## Development

For developers only below

### Client

Hosted on GitHub Pages and Itch.io

#### Dev Run

It will listen to the changes.

`npm run start:dev:client`

#### Prod Build

`npm run build:prod:client`

### Server

Hosted on Heroku and Glitch

#### Dev Run

First, you need to run the dev build that will listen to the changes and will build it and then you need to run the start in a separate cmd window. Upon changes, you need to manually restart the start command only.

-  `npm run build:dev:server`
-  `npm run start:dev:server`

#### Prod Build

`npm run build:prod:server`

[github-actions-workflow-image]: https://github.com/Game-Off-2020/the-big-cheese/workflows/Default/badge.svg
[github-actions-workflow-url]: https://github.com/Game-Off-2020/the-big-cheese/actions
[github-actions-deploy-workflow-image]: https://github.com/Game-Off-2020/the-big-cheese/workflows/Deploy/badge.svg
[github-actions-deploy-workflow-url]: https://github.com/Game-Off-2020/the-big-cheese/actions

# Special Thanks

-  Kenny Assets for the Assets (Sprites and Sounds) - https://www.kenney.nl/assets
-  Free sound for sounds - https://freesound.org/
-  Fonts from DA font - https://www.dafont.com/cactus-story.font
