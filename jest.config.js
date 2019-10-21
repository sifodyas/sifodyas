//@ts-check

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
    collectCoverageFrom: ['src/**/!(*.d).{ts,tsx}'],
    coverageReporters: ['json-summary', 'lcov', 'text-summary'],
    testPathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/test/**/?(*.)(spec|test).(ts|tsx)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    testEnvironmentOptions: {
        url: 'file://' + __dirname + '/test',
    }
};

module.exports = config;
