const { pathsToModuleNameMapper } = require('ts-jest/utils');
const paths = {
    "@phylojs": ["src"],
    "@phylojs/*": ["src/*"],
}

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testMatch: ['**/test/**/*.spec.ts'],
    moduleNameMapper: pathsToModuleNameMapper(paths, {
        prefix: '<rootDir>/',
    }),
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/types/**/*.ts',
    ],
    globals: {
        'ts-jest': {
            diagnostics: false,
            isolatedModules: true,
        },
    },
};
