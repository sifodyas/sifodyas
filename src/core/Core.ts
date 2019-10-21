import { readFile } from 'fs';
import { LogicException } from '../dependencyInjection/exception/LogicException';

export interface ResourceFile {
    path: string;
    content: string;
}

export type Parsable = string | number;

/**
 * Core class regrouping various core functions.
 */
export abstract class Core {
    /**
     * Provide a document.currentScript fallback.
     */
    public static currentScript: HTMLScriptElement = (() => {
        if (Core.isNodeJs()) {
            return '' as any;
        }
        return (document.currentScript || (() => document.querySelector('#currentScript'))()) as HTMLScriptElement;
    })();

    /**
     * Provide a simple way to test if we are in node env or not
     */
    public static isNodeJs() {
        return typeof document === 'undefined';
    }

    /**
     * Calculate Levenshtein distance between two strings.
     *
     * @param a One of the strings being evaluated for Levenshtein distance.
     * @param b One of the strings being evaluated for Levenshtein distance.
     * @returns The Levenshtein-Distance between the two argument strings or -1, if one of the argument strings is longer than the limit of 255 characters.
     */
    public static levenshtein(a: string, b: string): number {
        const an = a ? a.length : 0;
        const bn = b ? b.length : 0;
        if (an === 0) {
            return bn;
        }
        if (bn === 0) {
            return an;
        }
        const matrix = new Array<number[]>(bn + 1);
        for (let i = 0; i <= bn; ++i) {
            const row = (matrix[i] = new Array<number>(an + 1));
            row[0] = i;
        }
        const firstRow = matrix[0];
        for (let j = 1; j <= an; ++j) {
            firstRow[j] = j;
        }
        for (let i = 1; i <= bn; ++i) {
            for (let j = 1; j <= an; ++j) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] =
                        Math.min(
                            matrix[i - 1][j - 1], // substitution
                            matrix[i][j - 1], // insertion
                            matrix[i - 1][j], // deletion
                        ) + 1;
                }
            }
        }
        return matrix[bn][an];
    }

    /**
     * Take an input array and returns a new array without duplicate values.
     *
     * @param a An array source.
     * @returns The array with unique values.
     */
    public static array_unique<T>(a: T[]): T[] {
        return Array.from(new Set(([] as T[]).concat(a)));
    }

    /**
     * Computes the difference of arrays using keys for comparison.
     *
     * Compares the keys from a1 against the keys from a2 and returns the difference.
     * This function is like array_diff() except the comparison is done on the keys instead of the values.
     */
    public static array_diff_key<T>(a1: T[], ...a2: any[][]): T[] {
        const ret: T[] = [];

        Object.keys(a1).forEach(k1 => {
            for (const arg of a2) {
                for (const k of Object.keys(arg)) {
                    if (k === k1) {
                        return;
                    }
                }
                ret[k1 as any] = a1[k1 as any];
            }
        });

        return ret;
    }

    /**
     * Computes the difference of maps using keys for comparison.
     *
     * Compares the keys from m1 against the keys from m2 and returns the difference.
     * This function is like array_diff() except the comparison is done on the keys instead of the values.
     */
    public static map_diff_key<T>(m1: Map<string, T>, ...m2: Array<Map<string, any>>): Map<string, T> {
        const ret = new Map();

        if (!m1 || !m1.size) {
            return ret;
        }

        Array.from(m1.keys()).forEach(k1 => {
            for (const arg of m2) {
                for (const k of Array.from(arg.keys())) {
                    if (k === k1) {
                        return;
                    }
                }
                ret.set(k1, m1.get(k1));
            }
        });

        return ret;
    }

    /**
     * Converts a map (string key based) to an classic object.
     */
    public static mapToObject(map: Map<string, any>): any {
        const obj = Object.create(null);
        map.forEach((v, k) => (obj[k] = v));

        return obj;
    }

    /**
     * Convert AStringValue to a_string_value.
     *
     * @param str The string to converts.
     * @returns The string converted.
     */
    public static toSnakeCase(str: string): string {
        return str.replace(/\.?([A-Z]+)/g, (x, y) => `_${y.toLowerCase()}`).replace(/^_/, '');
    }

    /**
     * TypeGuard checking if x is a number value.
     *
     * @param x The value to check.
     * @returns True if is number, false otherwise.
     */
    public static isNumber(x: any): x is number {
        return typeof x === 'number';
    }

    /**
     * TypeGuard checking if x is a string value.
     *
     * @param x The value to check.
     * @returns True if is string, false otherwise.
     */
    public static isString(x: any): x is string {
        return typeof x === 'string';
    }

    /**
     * TypeGuard checking if x is a Map object.
     *
     * @param x The value to check.
     * @returns True if is Map, false otherwise.
     */
    public static isMap<K, V>(x: any): x is Map<K, V> {
        const map = x as Map<K, V>;
        return !!map && map.entries !== undefined && map.delete !== undefined;
    }

    /**
     * TypeGuard checking if x is an Array object.
     *
     * @param x The value to check.
     * @returns True if is array, false otherwise.
     */
    public static isArray<T>(x: any): x is T[] {
        return Array.isArray(x);
    }

    /**
     * TypeGuard checking if x is an object javascript way. (object or array but not null and not primitives)
     *
     * @param x The value to check.
     * @returns True if is native object, false otherwise.
     */
    public static isObject(x: any): x is object | any[] {
        return x === Object(x);
    }

    /**
     * TypeGuard checking if x is a pure Object.
     *
     * @param x The value to check.
     * @returns True if is Object (or JSON based), false otherwise.
     */
    public static isPureObject(x: any): x is object {
        return Core.isObject(x) && !Core.isArray(x);
    }

    /**
     * TypeGuard checking if x is a pure Object and if it respect a certain type.
     *
     * @param x The value to check.
     * @param dummy A dummy typed object for comparison without optional properties.
     * @param hasOptional Define if the type has optional properties.
     * @returns True if is Object (or JSON based) with good properties, false otherwise.
     */
    public static isPureTypedObject<T>(x: any, dummy: T, hasOptional: boolean = true): x is T {
        if (typeof dummy !== typeof x) {
            return false;
        }

        for (const prop in dummy) {
            if (dummy.hasOwnProperty(prop)) {
                if (!x.hasOwnProperty(prop)) {
                    return false; // not enough prop in x
                }
            }
        }

        if (!hasOptional) {
            for (const prop in x) {
                if (x.hasOwnProperty(prop)) {
                    if (!dummy.hasOwnProperty(prop)) {
                        return false; // to much prop in x
                    }
                }
            }
        }

        return Core.isPureObject(x);
    }

    public static isScalar(x: unknown): x is number | string | boolean {
        return typeof x === 'string' || typeof x === 'number' || typeof x === 'boolean';
    }

    /**
     * Gets entries from an object.
     * Uses Object.entries if available.
     *
     * @param obj The objects
     * @returns The entries.
     */
    public static objectEntries(obj: any): Array<[string, any]> {
        if (!obj) {
            return [];
        }
        Object.entries = Object.entries || ((o: any) => Object.keys(o).map(k => [k, o[k]]) as any);

        return Object.entries(obj);
    }

    /**
     * String.prototype.replace but returning a Promise instead of full string.
     */
    public static async replaceAsync(
        str: string,
        regex: RegExp,
        asyncReplacer: (substring: string, ...args: any[]) => Promise<string>,
    ) {
        const promises: Array<Promise<string>> = [];
        str.replace(regex, (match, ...args) => promises.push(asyncReplacer(match, ...args)) as any);
        const data = await Promise.all(promises);
        return str.replace(regex, () => data.shift() as string);
    }

    /**
     * Gets a resource from an Url.
     * Uses window.fetch if available.
     *
     * @throws LogicException when using xhr, if status is not 200.
     */
    public static getResource(resourceUrl: string): Promise<ResourceFile> {
        return new Promise<ResourceFile>((ok, ko) => {
            if (typeof document === 'undefined') {
                readFile(resourceUrl, (err, data) => {
                    if (err) {
                        ko(err);
                    } else {
                        ok({ path: resourceUrl, content: data.toString() });
                    }
                });
            } else if ('fetch' in window) {
                fetch(resourceUrl).then(res => {
                    res.text().then(txt => ok({ path: resourceUrl, content: txt }), ko);
                }, ko);
            } else {
                const xhr = new XMLHttpRequest();

                if (!xhr) {
                    throw new LogicException('XMLHttpRequest not available.');
                }

                xhr.onreadystatechange = ev => {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            ok({ path: resourceUrl, content: xhr.responseText });
                        } else {
                            throw new LogicException(
                                `The resource ${resourceUrl} resolving resulted with ${xhr.status} : ${xhr.statusText}`,
                            );
                        }
                    }
                };

                xhr.open('GET', resourceUrl);
                xhr.send(null);
            }
        });
    }

    /**
     * Gets the base path base on the current script url.
     */
    public static getBasePath(): string {
        if (!Core.isNodeJs()) {
            const tmpPath = Core.currentScript.src.replace(`${location.origin}/`, '');
            return tmpPath.substring(0, tmpPath.lastIndexOf('/'));
        }
        return process.cwd();
    }
}
