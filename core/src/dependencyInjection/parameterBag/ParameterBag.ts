import { Core } from '../../core/Core';
import { ParameterCircularReferenceException } from '../exception/ParameterCircularReferenceException';
import { ParameterNotFoundException } from '../exception/ParameterNotFoundException';
import { RuntimeException } from '../exception/RuntimeException';
import { IParameterBag } from './IParameterBag';

/**
 * Holds parameters.
 */
export class ParameterBag implements IParameterBag<unknown> {
    protected parameters: Map<string, unknown> = new Map();
    protected resolved: boolean = false;

    // I saw what you did there !!!!
    constructor(parameters: Map<string, unknown> = new Map(), public container: any /* Container */ = null) {
        parameters.forEach((value, key) => {
            this.parameters.set(key.toLowerCase(), value);
        });
    }

    private getComplex(name: string) {
        let ret: unknown = null; // tslint:disable-line:prefer-const
        this.parameters.forEach((_, key) => {
            if (name.startsWith(key)) {
                try {
                    eval(`ret = value${name.replace(key, '')};`); // tslint:disable-line:no-eval
                } finally {
                }
                return;
            }
        });

        return ret ?? null;
    }

    /**
     * Resolves parameters inside a string.
     *
     * @param value     The string to resolve
     * @param resolving An array of keys that are being resolved (used internally to detect circular references)
     *
     * @returns The resolved string
     *
     * @throws ParameterNotFoundException          if a placeholder references a parameter that does not exist
     * @throws ParameterCircularReferenceException if a circular reference if detected
     * @throws RuntimeException                    when a given parameter has a type problem.
     * @async
     */
    protected async resolveString(value: string, resolving: Map<string, any> = new Map()) {
        const MACHETTE = /^%([^%\s]+)%$/g.exec(value);
        if (MACHETTE) {
            const key = MACHETTE[1].toLowerCase();

            if (key in resolving) {
                throw new ParameterCircularReferenceException(Array.from(resolving.keys()));
            }

            resolving.set(key, true);

            return this.resolved ? this.get(key) : (this.resolveValue(await this.get(key), resolving) as any);
        }

        return Core.replaceAsync(value, /%%|%([^%\s]+)%/g, async (_, trouvaille) => {
            if (!trouvaille) {
                return '%%';
            }
            const key = trouvaille.toLowerCase();
            if (resolving.has(key)) {
                throw new ParameterCircularReferenceException(Array.from(resolving.keys()));
            }

            if (0 === key.indexOf('env(') && ')' === key.substr(-1) && 'env()' !== key) {
                const env = key.substring(4, key.length - 1);
                if (this.container) {
                    return this.container.resolveEnvs(env, true);
                }
                return `%${key}%`;
            }

            const resolved = await this.get(key);

            if (!Core.isString(resolved) && !Core.isNumber(resolved)) {
                throw new RuntimeException(
                    `A string value must be composed of strings and/or numbers, but found parameter "${key}" of type ${typeof resolved} inside string "${value}".`,
                );
            }

            const strResolved = `${resolved}`;
            resolving.set(key, true);

            return this.resolved ? strResolved : this.resolveString(strResolved, resolving);
        });
    }

    public clear() {
        this.parameters.clear();
    }

    public add(parameters: Map<string, unknown>) {
        parameters.forEach((value, key) => {
            this.parameters.set(key.toLowerCase(), value);
        });
    }

    public all(): Map<string, unknown> {
        return this.parameters;
    }

    public async get(name: string) {
        const lowerName = name?.toLowerCase() ?? '';
        if (!this.parameters.has(lowerName)) {
            if (!lowerName) {
                throw new ParameterNotFoundException('Parameter name is empty !');
            }

            const deeperParameter = this.getComplex(name);
            if (null !== deeperParameter) {
                return deeperParameter;
            }

            if (0 === lowerName.indexOf('env(') && ')' === lowerName.substr(-1) && 'env()' !== lowerName) {
                const env = lowerName.substring(4, lowerName.length - 1);
                if (this.container) {
                    return this.container.resolveEnvs(env, true);
                }
                return lowerName;
            }

            const alternatives: string[] = [];
            this.parameters.forEach((_, key) => {
                const lev = Core.levenshtein(lowerName, key);
                if (lev <= lowerName.length / 3 || key.includes(lowerName)) {
                    alternatives.push(key);
                }
            });

            if (alternatives.length) {
                throw new ParameterNotFoundException(
                    `Did you mean ${alternatives.length > 1 ? 'one of these' : 'this'}: ${alternatives.join(', ')} ?`,
                );
            } else {
                throw new ParameterNotFoundException(`${lowerName} not found.`);
            }
        }

        return this.parameters.get(lowerName);
    }

    public remove(name: string) {
        this.parameters.delete(name);
    }

    public set(name: string, value: unknown) {
        this.parameters.set(name.toLowerCase(), value);
    }

    public has(name: string) {
        return this.parameters.has(name.toLowerCase());
    }

    public async resolve() {
        if (this.resolved) {
            return;
        }

        const parameters: Map<string, unknown> = new Map();
        for (const [key, value] of this.parameters) {
            try {
                parameters.set(key, this.unescapeValue(await this.resolveValue(value)));
            } catch (e) {
                throw new ParameterNotFoundException(
                    `Can't resolve ${key} value. (${(e as ParameterNotFoundException).message})`,
                );
            }
        }

        this.parameters = parameters;
        this.resolved = true;
    }

    public async resolveValue(value: unknown, resolving: Map<string, unknown> = new Map()) {
        if (Core.isString(value)) {
            return this.resolveString(value, resolving) as any;
        }

        if (Core.isMap<string, unknown>(value)) {
            const result: Map<string, unknown> = new Map();
            for (const [k, v] of value) {
                result.set(await this.resolveValue(k, resolving), await this.resolveValue(v, resolving));
            }

            return result as any;
        }

        if (Core.isPureObject(value)) {
            const result: any = {};
            for (const prop in value) {
                if (!value.hasOwnProperty(prop)) {
                    continue;
                }
                result[await this.resolveValue(prop, resolving)] = await this.resolveValue(value[prop], resolving);
            }

            return result;
        }

        if (Core.isArray(value)) {
            const result: any = [];
            for (const prop in value) {
                if (!value.hasOwnProperty(prop)) {
                    continue;
                }
                result[prop] = await this.resolveValue(value[prop], resolving);
            }

            return result;
        }

        return value;
    }

    public escapeValue(value: unknown) {
        if (Core.isString(value)) {
            return value.replace(/%/g, '%%');
        }

        if (Core.isMap<string, unknown>(value)) {
            const result: Map<string, unknown> = new Map();
            value.forEach((v, k) => {
                result.set(k, this.escapeValue(v));
            });

            return result;
        }

        return value;
    }

    public unescapeValue(value: unknown) {
        if (Core.isString(value)) {
            return value.replace(/%%/g, '%');
        }

        if (Core.isMap<string, unknown>(value)) {
            const result: Map<string, unknown> = new Map();
            value.forEach((v, k) => {
                result.set(k, this.unescapeValue(v));
            });

            return result;
        }

        return value;
    }
}
