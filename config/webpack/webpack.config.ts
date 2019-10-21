import CircularDependencyPlugin from 'circular-dependency-plugin';
import semver from 'semver';
import webpack from 'webpack';
import VisualizerPlugin from 'webpack-visualizer-plugin';
import buildConfig from './build.webpack.config';
import exampleConfig from './example.webpack.config';
import options, { packageJson } from './options';

export interface WebpackEnvParam {
    production?: boolean;
    development?: boolean;
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

export default function webpackConfig(environment: WebpackEnvParam): webpack.Configuration[] {
    const baseConfig: webpack.Configuration = {
        devtool: 'source-map',
        mode: environment.production ? 'production' : 'development',
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
            modules: [options.alias['@npm']],
        },
        resolveLoader: {
            alias: options.alias,
            modules: [options.alias['@npm']],
        },
        plugins: [new webpack.DefinePlugin(definedConst), new CircularDependencyPlugin(), new VisualizerPlugin()],
        node: {
            fs: 'empty',
            process: false,
        },
    };

    const customeRules: CustomRules = {
        ts: (target: RuleTarget) => {
            const ret: webpack.RuleSetRule[] = [
                {
                    enforce: 'pre',
                    test: /\.tsx?$/,
                    use: [{ loader: 'source-map-loader' }],
                },
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            // awesome-typescript-loader cannot be used until https://github.com/s-panferov/awesome-typescript-loader/issues/411 is not resolved.
                            // loader: 'awesome-typescript-loader',
                            loader: 'ts-loader',
                            options: {
                                // configFileName: `${options.alias['@root']}/${target}/tsconfig.json`, // ATL
                                configFile: `${options.alias['@root']}/${target}/tsconfig.json`, // TSL,
                                transpileOnly: environment.watch,
                                experimentalWatchApi: true,
                            },
                        },
                    ],
                },
            ];

            return ret;
        },
    };

    return [buildConfig(environment, baseConfig, customeRules), exampleConfig(environment, baseConfig, customeRules)];
}

type RuleTarget = 'src' | 'example';
type CustomRuleFn = (target: RuleTarget) => webpack.RuleSetRule[];
export interface CustomRules {
    ts: CustomRuleFn;
    [P: string]: CustomRuleFn;
}
