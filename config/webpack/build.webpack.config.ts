import CircularDependencyPlugin from 'circular-dependency-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import webpack from 'webpack';
import options, { packageJson } from './options';
import { CustomRules, WebpackEnvParam } from './webpack.config';

const deps = {};
Object.keys(packageJson.dependencies).forEach(dep => {
    deps[dep] = dep;
});

deps['fs'] = 'fs';

console.info(`\x1b[4m\x1b[36mBUILD ${packageJson.name} FOR ${packageJson.version}\x1b[0m`);

const banner = `/*!\n${fs
    .readFileSync(path.resolve(options.alias['@root'], 'LICENSE'), { encoding: 'utf-8' })
    .split('\n')
    .map(line => ` * ${line}`)
    .join('\n')}\n */`;

export default (
    environment: WebpackEnvParam,
    baseConfig: webpack.Configuration,
    customRules: CustomRules,
): webpack.Configuration => ({
    ...baseConfig,
    name: 'build',
    entry: {
        app: `${options.alias['@app']}/index.ts`,
    },
    externals: deps,
    output: {
        path: options.alias['@output'],
        filename: 'index.js',
        libraryTarget: 'commonjs',
    },
    module: {
        rules: [...customRules.ts('src')],
    },
    plugins: [
        ...baseConfig.plugins,
        ...(environment.development
            ? [
                  new CircularDependencyPlugin({
                      allowAsyncCycles: false,
                  }),
              ]
            : []),
        new ForkTsCheckerWebpackPlugin({
            async: false,
            useTypescriptIncrementalApi: true,
            tsconfig: `${options.alias['@root']}/src/tsconfig.json`,
            watch: path.resolve(options.alias['@root'], 'src'),
        }),
        new webpack.BannerPlugin({
            banner,
            raw: true,
        }),
        new class DtsBanner implements webpack.Plugin {
            public apply(compiler: webpack.Compiler) {
                compiler.hooks.done.tap('DtsBanner', () => {
                    glob(path.resolve(options.alias['@output'], '**/*.d.ts'), (err, matches) => {
                        for (const filePath of matches) {
                            fs.writeFileSync(
                                filePath,
                                `${banner}\n\n${fs.readFileSync(filePath, { encoding: 'utf-8' })}`,
                                { encoding: 'utf-8' },
                            );
                        }
                    });
                });
            }
        }(),
    ],
});
