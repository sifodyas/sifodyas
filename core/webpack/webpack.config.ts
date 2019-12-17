// tslint:disable:object-literal-sort-keys
// tslint:disable:no-console
// tslint:disable:no-default-export
import CircularDependencyPlugin from 'circular-dependency-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path from 'path';
import semver from 'semver';
import webpack from 'webpack';
import VisualizerPlugin from 'webpack-visualizer-plugin';
import { banner, DtsBanner, externals } from '../../scripts/webpack-utils';
import packageJson from '../package.json';

const ROOT_APP_PATH = path.resolve(__dirname, '../');

export interface WebpackEnvParam {
    watch?: boolean;
}

const VERSION = packageJson.version;
const versionSemver = semver.coerce(VERSION);
let EXTRA_VERSION = VERSION.replace(/[0-9]+\.[0-9]+\.[0-9]+-/gi, '');
EXTRA_VERSION = EXTRA_VERSION === VERSION ? '' : EXTRA_VERSION;

const definedConst = {
    EXTRA_VERSION,
    VERSION,
    VERSION_ID: parseInt(versionSemver.raw.replace(/\./gi, '0'), 10),
    MAJOR_VERSION: versionSemver.major,
    MINOR_VERSION: versionSemver.minor,
    RELEASE_VERSION: versionSemver.patch,
};

Object.entries(definedConst).forEach(([key, value]) => {
    definedConst[key] = JSON.stringify(value);
});

console.info(`\x1b[4m\x1b[36mBUILD ${packageJson.name} FOR ${packageJson.version}\x1b[0m`);

export default function webpackConfig(environment?: WebpackEnvParam): webpack.Configuration {
    return {
        devtool: 'source-map',
        mode: 'development',
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
        node: {
            fs: 'empty',
            process: false,
        },
        entry: {
            app: `${ROOT_APP_PATH}/src/index.ts`,
        },
        externals: [...externals(), ...externals(path.resolve(__dirname, '../'))],
        output: {
            path: `${ROOT_APP_PATH}/dist`,
            filename: 'index.js',
            libraryTarget: 'commonjs',
        },
        module: {
            rules: [
                {
                    enforce: 'pre',
                    test: /\.tsx?$/,
                    use: [{ loader: 'source-map-loader' }],
                },
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                configFile: `${ROOT_APP_PATH}/src/tsconfig.json`, // TSL,
                                transpileOnly: !!environment?.watch,
                                experimentalWatchApi: true,
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin(definedConst),
            new VisualizerPlugin(),
            new CircularDependencyPlugin({
                allowAsyncCycles: false,
            }),
            new ForkTsCheckerWebpackPlugin({
                async: false,
                useTypescriptIncrementalApi: true,
                tsconfig: `${ROOT_APP_PATH}/src/tsconfig.json`,
                watch: path.resolve(ROOT_APP_PATH, 'src'),
            }),
            new webpack.BannerPlugin({
                banner,
                raw: true,
            }),
            new DtsBanner(`${ROOT_APP_PATH}/dist`),
        ],
    };
}
