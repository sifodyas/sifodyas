// tslint:disable:object-literal-sort-keys
// tslint:disable:no-console
// tslint:disable:no-default-export
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import path from 'path';
import webpack from 'webpack';
import { banner, DtsBanner, externals } from '../../../../scripts/webpack-utils';
import packageJson from '../package.json';

const ROOT_APP_PATH = path.resolve(__dirname, '../');

export interface WebpackEnvParam {
    watch?: boolean;
}

console.info(`\x1b[4m\x1b[36mBUILD ${packageJson.name} FOR ${packageJson.version}\x1b[0m`);

export default function webpackConfig(environment?: WebpackEnvParam): webpack.Configuration {
    return {
        devtool: 'source-map',
        mode: 'development',
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
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
            new ForkTsCheckerWebpackPlugin({
                async: false,
                useTypescriptIncrementalApi: true,
                tsconfig: `${ROOT_APP_PATH}/src/tsconfig.json`,
                watch: path.resolve(ROOT_APP_PATH),
            }),
            new webpack.BannerPlugin({
                banner,
                raw: true,
            }),
            new DtsBanner(`${ROOT_APP_PATH}/dist`),
        ],
    };
}
