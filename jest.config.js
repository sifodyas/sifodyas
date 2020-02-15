//@ts-check
const { pathsToModuleNameMapper } = require('ts-jest/utils');
const path = require('path');
const fs = require('fs');

const tsconfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, './test/tsconfig.json'), { encoding: 'utf-8' }));
const moduleNameMapper = pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
    prefix: '<rootDir>',
});

/** @type Partial<jest.DefaultOptions> & { [K: string]: any } */
const config = {
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/test/tsconfig.json'
        }
    },
    preset: 'ts-jest',
    setupFilesAfterEnv: ['<rootDir>/test/__tools__/setup.ts'],
    transform: {
        '.(ts|tsx)': 'ts-jest',
    },
    collectCoverageFrom: ['{core,lib}/**/src/**/!(*.d).{ts,tsx}'],
    coverageReporters: ['json-summary', 'lcov', 'text-summary'],
    testPathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/test/**/?(*.)(spec|test).(ts|tsx)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    testEnvironmentOptions: {
        url: 'file://' + __dirname + '/test',
    },
    moduleNameMapper,
};

module.exports = config;
