import { Core } from '../../core';
import { Container } from '../Container';
import { EnvNotFoundException, RuntimeException } from '../exception';
import { PrefixParserRegister } from './PrefixParserRegister';

type GetEnvFunction = (name: string) => string;
export type EnvPrefix = 'base64' | 'boolean' | 'float' | 'int' | 'json' | 'resolve' | 'string';

export class EnvVarProcessor {
    private systemEnvCaseResolver: Map<string, string | undefined> = new Map();
    public constructor(private container: Container) {
        if (process?.env) {
            Object.keys(process.env).forEach(env => {
                this.systemEnvCaseResolver.set(env.toLowerCase(), process.env[env]);
            });
        }

        if (!Core.isNodeJs()) {
            Object.keys(window)
                .filter(k => k.startsWith('ENV_'))
                .forEach(env => {
                    this.systemEnvCaseResolver.set(env.replace('ENV_', '').toLowerCase(), window[env]);
                });
        }
    }

    public getEnv(prefix: EnvPrefix, name: string, getEnvFunction: GetEnvFunction): unknown {
        const i = name.indexOf(':');

        // TODO: Handle without async
        // if (prefix === 'file') {
        //     const file = await getEnvFunction(name);
        //     if (!Core.isScalar(file)) {
        //         throw new RuntimeException(`Invalid file url: env var "${name}" is non-scalar.`);
        //     }

        //     return (await Core.getResource(file)).content;
        // }

        let env: string | undefined;
        if (-1 !== i || prefix !== 'string') {
            env = getEnvFunction(name);
            if (null === env) {
                return;
            }
        } else if (name in process?.env ?? {}) {
            env = process.env[name];
        } else if (window && `ENV_${name}` in window) {
            env = window[`ENV_${name}`];
        } else if (this.systemEnvCaseResolver.has(name)) {
            env = this.systemEnvCaseResolver.get(name);
        } else if (null === env) {
            if (!this.container.hasParameter(`env(${name})`)) {
                throw new EnvNotFoundException(name);
            }

            env = this.container.getParameter(`env(${name})`) as string;
            if (null === env) {
                return;
            }
        }

        if (!Core.isScalar(env)) {
            throw new RuntimeException(`Non-scalar env var "${name}" cannot be cas to ${prefix}.`);
        }

        if (prefix === 'string') {
            return `${env}`;
        }

        if (prefix === 'boolean') {
            if (env === '0' || env === 'false') {
                return false;
            }
            return !!env;
        }

        if (prefix === 'int') {
            return parseInt(env, 10);
        }

        if (prefix === 'float') {
            return parseFloat(env);
        }

        if (prefix === 'base64') {
            return atob(env);
        }

        if (prefix === 'json') {
            try {
                return JSON.parse(env);
            } catch (e) {
                throw new RuntimeException(`Invalid JSON env var "${name}": ${e.message}`);
            }
        }

        if (prefix === 'resolve') {
            return env.replace(/%%|%([^%\s]+)%/, (_, paramName) => {
                if (!paramName) {
                    return '%';
                }

                const value = this.container.getParameter(paramName);
                if (!Core.isScalar(value)) {
                    throw new RuntimeException(
                        `Parameter "${paramName}" found when resolving env var "${name}" must be scalar, "${typeof value}" given.`,
                    );
                }

                return `${value}`;
            });
        }

        const prefixParser = PrefixParserRegister.getAll().filter(p => p.getPrefix() === prefix)[0];

        if (!prefixParser) {
            throw new RuntimeException(
                `Env prefix parser for "${prefix}" was not found. Make sure the right pass is loaded.`,
            );
        }

        return prefixParser.parse(env);
    }
}
