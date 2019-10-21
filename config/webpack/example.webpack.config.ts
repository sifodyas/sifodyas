// tslint:disable:object-literal-sort-keys
import fs from 'fs';
import webpack from 'webpack';
import options from './options';
import { CustomRules, WebpackEnvParam } from './webpack.config';

export default (
    environment: WebpackEnvParam,
    baseConfig: webpack.Configuration,
    customRules: CustomRules,
): webpack.Configuration => ({
    ...baseConfig,
    name: 'example',
    entry: {
        app: `${options.alias['@example']}/index.ts`,
    },
    output: {
        path: `${options.alias['@example']}/compiled/`,
        filename: 'index.js',
        publicPath: 'http://localhost:8080',
    },
    resolve: {
        ...baseConfig.resolve,
        alias: {
            '@sifodyas/sifodyas': `${options.alias['@app']}/index.ts`,
        },
    },
    module: {
        rules: [...customRules.ts('example')],
    },
    devServer: {
        contentBase: options.alias['@example'],
    },
    plugins: [
        ...baseConfig.plugins,
        new class {
            public apply(compiler: webpack.Compiler): void {
                compiler.hooks.afterCompile.tap('add-bundle-watch', compilation => {
                    compilation.contextDependencies.add(options.alias['@app']);

                    const exempleConfigPath = `${options.alias['@example']}/config/`;
                    fs.readdirSync(exempleConfigPath).forEach(p =>
                        compilation.fileDependencies.add(exempleConfigPath + p),
                    );
                });
            }
        }(),
    ],
});
