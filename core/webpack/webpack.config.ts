// tslint:disable:object-literal-sort-keys
// tslint:disable:no-default-export
import CircularDependencyPlugin from 'circular-dependency-plugin';
import semver from 'semver';
import webpack from 'webpack';
import VisualizerPlugin from 'webpack-visualizer-plugin';
import defaultConfig from '../../scripts/webpack-other.config';
import packageJson from '../package.json';

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

export default function webpackConfig(environment?: WebpackEnvParam): webpack.Configuration {
    const conf = defaultConfig(environment);
    return {
        ...conf,
        node: {
            fs: 'empty',
            process: false,
        },
        plugins: [
            ...conf.plugins,
            new webpack.DefinePlugin(definedConst),
            new VisualizerPlugin(),
            new CircularDependencyPlugin({
                allowAsyncCycles: false,
            }),
        ],
    };
}
