/* eslint-disable import/no-default-export */
/* eslint-disable no-console */

import path from 'path';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import webpack from 'webpack';
import { banner, DtsBanner, externals, APP_PACKAGE_JSON as packageJson, ROOT_APP_PATH } from './webpack-utils';

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
        externals: [...externals(), ...externals(ROOT_APP_PATH)],
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
                // useTypescriptIncrementalApi: true,
                typescript: {
                    configFile: `${ROOT_APP_PATH}/src/tsconfig.json`,
                },
                // watch: path.resolve(ROOT_APP_PATH, 'src'),
            }),
            new webpack.BannerPlugin({
                banner,
                raw: true,
            }),
            new DtsBanner(`${ROOT_APP_PATH}/dist`),
        ],
    };
}
