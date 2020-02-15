# Sifodyas

<img align="right" src="docs/img/sifodyas.svg" height="200" alt="Sifodyas Logo" title="Sifodyas Logo"/>

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Bring the famous bundle / kernel logic to Javascript

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
See the [Upgrade](./UPGRADE.md) file for more informations.

## Contributing
The contributing process need to be defined before being open.

## Todo
- [ ] More tests
- [ ] Switch IOC/DI system to [Inversify](https://github.com/inversify/InversifyJS) through a plugin system
- [x] Switch TypeScript to strict and 3.7 features

## License
[MIT](LICENSE)
