# Sifodyas

<img align="right" src="docs/img/sifodyas.svg" height="200" alt="Sifodyas Logo" title="Sifodyas Logo"/>

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub license](https://img.shields.io/npm/v/@sifodyas/sifodyas.svg)](LICENSE)

Bring the famous bundle / kernel logic to Javascript

## About this repository
This repository is setup as a monorepository containing Sifodyas itself and some additional plugins and bundles.

- `@sifodyas/sifodyas`: (core/)
- `@sifodyas/fp-di`: (lib/plugins/fp-di/) Provide a way to have DI from Sifodyas container into Functional Programing (or functional components)
- `@sifodyas/yaml-env-parser`: (lib/plugins/yaml-env-parser) Parse yaml from env variables in Sifodyas config
- `@sifodyas/yaml-loader`: (lib/plugins/yaml-loader) Add a YamlLoader to Sifodyas

## Installation
### yarn
`$ yarn add @sifodyas/sifodyas`
### npm
`$ npm install --save @sifodyas/sifodyas`

## About
Sifodyas is a system based on Kernel/Bundle mechanic, that allow to separate and box features in package mode while
giving them possibility to share and use services and parameters through a common container, and allow to load them
asynchronously without blocking the browser.  
See [the documentation](docs/) for architectural details and implementations examples.

## Upgrade
See the [Upgrade](core/UPGRADE.md) file for more informations.

## Contributing
The contributing process need to be defined before being open.

## Todo
- [ ] More tests + auto dedupe nodejs tests
- [ ] Switch IOC/DI system to [Inversify](https://github.com/inversify/InversifyJS) through a plugin system
- [x] Switch TypeScript to strict and 3.7 features

## License
[MIT](LICENSE)
